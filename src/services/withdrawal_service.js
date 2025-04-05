import { db, auth } from '@/services/firebase_config';
import {collection, doc, getDoc, getDocs, query, where,
    addDoc, serverTimestamp, onSnapshot, updateDoc, increment} from 'firebase/firestore';
import { logInfo, logError } from '@/utils/logger';
import { getSystemSettings } from '@/services/system_service';
import SecureLS from "secure-ls";

export const getUserBalances = (callback) => {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error('Usuario no autenticado');

        const investmentsQuery = query(
            collection(db, 'investments'),
            where('userId', '==', userId),
            where('status', '==', 'approved')
        );

        return onSnapshot(investmentsQuery, async (investmentsSnap) => {
            try {
                if (investmentsSnap.empty) {
                    callback({
                        hasPlan: false,
                        canWithdrawEarnings: false,
                        daysForWithdrawal: 0,
                        message: 'Necesita tener un plan activo para realizar retiros',
                        total: 0
                    });
                    return;
                }

                // Obtener retiros pendientes
                const pendingWithdrawalsQuery = query(
                    collection(db, 'withdrawals'),
                    where('userId', '==', userId),
                    where('status', '==', 'pending')
                );
                const pendingWithdrawalsSnap = await getDocs(pendingWithdrawalsQuery);
                let totalPendingWithdrawals = 0;
                let hasPendingWithdrawal = false;

                pendingWithdrawalsSnap.forEach(doc => {
                    hasPendingWithdrawal = true;
                    totalPendingWithdrawals += Number(doc.data().amount || 0);
                });

                let totalInvestment = 0;
                let totalEarnings = 0;
                let isCompleted = true;
                let canWithdrawEarnings = false;
                let daysForWithdrawal = 0;

                investmentsSnap.forEach(doc => {
                    const investment = doc.data();
                    totalInvestment += Number(investment.investment || 0);
                    totalEarnings += Number(investment.earnings || 0);

                    const activationDate = investment.activationDate.toDate();
                    const withdrawalStartDate = new Date(activationDate);
                    withdrawalStartDate.setDate(withdrawalStartDate.getDate() + 2);
                    const currentDate = new Date();
                    const daysSinceActivation = Math.floor((currentDate - withdrawalStartDate) / (1000 * 60 * 60 * 24));

                    const totalDays = investment.duration * 30;
                    const minDaysForWithdrawal = Math.ceil((investment.porcentajeMinRetiro / 100) * totalDays);

                    daysForWithdrawal = Math.max(0, minDaysForWithdrawal - daysSinceActivation);

                    if (daysSinceActivation >= minDaysForWithdrawal) {
                        canWithdrawEarnings = true;
                    }

                    const expirationDate = investment.expirationDate.toDate();
                    if (currentDate < expirationDate) {
                        isCompleted = false;
                    }
                });

                // Obtener bonus por referidos
                const referralQuery = query(collection(db, 'referralCodes'), where('userId', '==', userId));
                const referralSnap = await getDocs(referralQuery);
                let referralBonus = 0;

                referralSnap.forEach(doc => {
                    const referral = doc.data();
                    if (referral.earnings) {
                        referralBonus += Number(referral.earnings);
                    }
                });

                // Formatear números con 2 decimales
                totalInvestment = Number(totalInvestment.toFixed(2));
                totalEarnings = Number(totalEarnings.toFixed(2));
                referralBonus = Number(referralBonus.toFixed(2));
                totalPendingWithdrawals = Number(totalPendingWithdrawals.toFixed(2));

                // Calcular el total disponible
                let total = 0;
                if (isCompleted) {
                    total = totalInvestment + totalEarnings + referralBonus;
                } else if (canWithdrawEarnings) {
                    total = totalEarnings + referralBonus;
                } else if (referralBonus > 0) {
                    total = referralBonus;
                    canWithdrawEarnings = true;
                }

                // Restar los retiros pendientes
                total = Number((total - totalPendingWithdrawals).toFixed(2));

                logInfo(`Total calculado: ${total} (Inversión: ${totalInvestment}, Ganancias: ${totalEarnings}, Referidos: ${referralBonus}, Retiros Pendientes: ${totalPendingWithdrawals})`);

                callback({
                    hasPlan: true,
                    investment: totalInvestment,
                    earnings: totalEarnings,
                    referralBonus,
                    isCompleted,
                    canWithdrawEarnings,
                    daysForWithdrawal,
                    total,
                    hasPendingWithdrawal,
                    totalPendingWithdrawals
                });

            } catch (error) {
                logError('Error procesando datos de balance:', error);
                callback(null);
            }
        });

    } catch (error) {
        logError('Error al obtener saldos:', error);
        callback(null);
        return () => {};
    }
};

export const createWithdrawalRequest = async (amount) => {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error('Usuario no autenticado');

        const balances = await new Promise((resolve, reject) => {
            // Almacenar la función de cancelación del listener
            const unsubscribe = getUserBalances((balancesData) => {
                if (!balancesData) {
                    reject(new Error('No se pudieron obtener los balances'));
                } else {
                    // Cancelar el listener inmediatamente después de recibir datos
                    unsubscribe();
                    resolve(balancesData);
                }
            });
        });

        const systemSettings = await getSystemSettings();
        const withdrawalFee = Number((amount * systemSettings.withdrawal / 100).toFixed(2));
        const netAmount = Number((amount - withdrawalFee).toFixed(2));

        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.data();

        const withdrawalData = {
            userId,
            userName: userData.nombre,
            email: userData.email,
            socioId: userData.socioId || null,
            amount: Number(amount),
            netAmount,
            withdrawalFee,
            walletAddress: userData.wallet,
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            balanceInfo: {
                investment: balances.investment,
                earnings: balances.earnings,
                referralBonus: balances.referralBonus,
                isCompleted: balances.isCompleted
            },
        };

        const docRef = await addDoc(collection(db, 'withdrawals'), withdrawalData);
        logInfo('Solicitud de retiro creada:', docRef.id);
        return docRef.id;
    } catch (error) {
        logError('Error al crear solicitud de retiro:', error);
        throw error;
    }
};

export const updateBalancesAfterWithdrawal = async (withdrawalId) => {
    try {
        const withdrawalDoc = await getDoc(doc(db, 'withdrawals', withdrawalId));
        const withdrawalData = withdrawalDoc.data();
        const userId = withdrawalData.userId;
        let remainingAmount = withdrawalData.amount;

        // Primero procesar todas las inversiones
        const investmentsQuery = query(collection(db, 'investments'),
            where('userId', '==', userId),
            where('status', '==', 'approved')
        );
        const investmentsSnap = await getDocs(investmentsQuery);

        // Procesar cada inversión
        for (const docInv of investmentsSnap.docs) {
            const investment = docInv.data();

            if (remainingAmount > 0 && investment.earnings > 0) {
                const amountToDeduct = Math.min(remainingAmount, investment.earnings);
                await updateDoc(doc(db, 'investments', docInv.id), {
                    earnings: increment(-amountToDeduct)
                });
                remainingAmount -= amountToDeduct;
            }

            if (investment.expirationDate.toDate() <= new Date() && remainingAmount > 0) {
                const amountToDeduct = Math.min(remainingAmount, investment.investment);
                await updateDoc(doc(db, 'investments', docInv.id), {
                    investment: increment(-amountToDeduct)
                });
                remainingAmount -= amountToDeduct;
            }
        }

        // Procesar referidos
        if (remainingAmount > 0) {
            const referralQuery = query(collection(db, 'referralCodes'),
                where('userId', '==', userId)
            );
            const referralSnap = await getDocs(referralQuery);

            for (const docRef of referralSnap.docs) {
                const referral = docRef.data();
                if (remainingAmount > 0 && referral.earnings > 0) {
                    const amountToDeduct = Math.min(remainingAmount, referral.earnings);
                    await updateDoc(doc(db, 'referralCodes', docRef.id), {
                        earnings: increment(-amountToDeduct)
                    });
                    remainingAmount -= amountToDeduct;
                }
            }
        }

        // Solo actualizar el estado después de procesar todos los balances
        await updateDoc(doc(db, 'withdrawals', withdrawalId), {
            status: 'completed',
            'balanceInfo.isCompleted': true,
            updatedAt: serverTimestamp()
        });

        logInfo('Saldos actualizados después del retiro');
    } catch (error) {
        logError('Error al actualizar saldos después del retiro:', error);
        throw error;
    }
};

export const subscribeToUserWithdrawals = (callback, showAllData = false) => {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error('Usuario no autenticado');

        const ls = new SecureLS({ encodingType: 'aes' });
        const userRole = ls.get('user_role');
        let withdrawalsQuery;

        if (showAllData) {
            // Si showAllData es true, obtener todos los retiros
            withdrawalsQuery = query(collection(db, 'withdrawals'));
        } else {
            // Lógica original de filtrado
            switch (userRole) {
                case 'admin':
                    withdrawalsQuery = query(
                        collection(db, 'withdrawals'),
                        where('socioId', '==', null)
                    );
                    break;
                case 'socio':
                    withdrawalsQuery = query(
                        collection(db, 'withdrawals'),
                        where('socioId', '==', userId)
                    );
                    break;
                default:
                    withdrawalsQuery = query(
                        collection(db, 'withdrawals'),
                        where('userId', '==', userId)
                    );
                    break;
            }
        }

        const unsubscribe = onSnapshot(withdrawalsQuery, (snapshot) => {
            const withdrawals = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                withdrawals.push({
                    id: doc.id,
                    usuario: data.userName,
                    fecha: data.createdAt?.toDate().toLocaleDateString() || 'N/A',
                    billetera: data.walletAddress,
                    monto: data.netAmount,
                    comision: data.withdrawalFee,
                    estado: data.status,
                    ...data
                });
            });
            withdrawals.sort((a, b) => b.createdAt - a.createdAt);
            callback(withdrawals);
        });

        return unsubscribe;
    } catch (error) {
        logError('Error al suscribirse a retiros:', error);
        callback([]);
        return () => {};
    }
};