import { collection, onSnapshot, query, getDocs, where } from "firebase/firestore";
import { auth, db } from "@/services/firebase_config.js";
import { logError, logInfo } from "@/utils/logger.js";

export const subscribeToSocioUsersList = async (callback, socioId) => {
    try {
        if (!auth.currentUser) throw new Error('No hay usuario autenticado');

        const userQuery = query(
            collection(db, 'users'),
            where('socioId', '==', socioId),
            where('role', '==', 'user')
        );
        const investmentsRef = collection(db, 'investments');

        const unsubscribe = onSnapshot(userQuery, async (snapshot) => {
            const usersData = [];
            const investmentsSnapshot = await getDocs(query(investmentsRef, where('status', '==', 'approved')));
            const investmentsMap = new Map(
                investmentsSnapshot.docs.map(doc => [doc.data().userId, doc.data()])
            );

            snapshot.forEach((doc) => {
                usersData.push({
                    id: doc.id,
                    ...doc.data(),
                    hasActivePlan: investmentsMap.has(doc.id)
                });
            });

            logInfo('Total usuarios del socio:', usersData.length);
            callback(usersData);
        });

        return unsubscribe;
    } catch (error) {
        logError('Error en suscripción de usuarios:', error.message);
        throw error;
    }
};

export const subscribeToSocioInvestments = async (callback, socioId) => {
    try {
        if (!auth.currentUser) throw new Error('No hay usuario autenticado');

        const userQuery = query(collection(db, 'users'), where('socioId', '==', socioId));
        const investmentsRef = collection(db, 'investments');

        const unsubscribe = onSnapshot(query(investmentsRef), async (investmentsSnapshot) => {
            const userIds = (await getDocs(userQuery)).docs.map(doc => doc.id);
            const totalInvestments = investmentsSnapshot.docs.reduce((total, doc) => {
                const investment = doc.data();
                return investment.status === 'approved' && userIds.includes(investment.userId)
                    ? total + Number(investment.investment || 0)
                    : total;
            }, 0);

            callback(Number(totalInvestments.toFixed(2)));
        });

        return unsubscribe;
    } catch (error) {
        logError('Error en suscripción de inversiones:', error.message);
        throw error;
    }
};

export const subscribeToSocioWithdrawals = async (callback, socioId) => {
    try {
        if (!auth.currentUser) throw new Error('No hay usuario autenticado');

        const withdrawalsQuery = query(
            collection(db, 'withdrawals'),
            where('socioId', '==', socioId)
        );

        const unsubscribe = onSnapshot(withdrawalsQuery, (snapshot) => {
            const withdrawals = snapshot.docs.map(doc => ({
                id: doc.id,
                usuario: doc.data().userName,
                fecha: doc.data().createdAt?.toDate().toLocaleDateString() || 'N/A',
                billetera: doc.data().walletAddress,
                monto: doc.data().netAmount,
                comision: doc.data().withdrawalFee,
                estado: doc.data().status,
                isReferral: doc.data().isReferral || false,
                amount: doc.data().amount || 0,
                ...doc.data()
            })).sort((a, b) => b.createdAt - a.createdAt);

            callback(withdrawals);
        });

        return unsubscribe;
    } catch (error) {
        logError('Error en suscripción de retiros:', error.message);
        callback([]);
        return () => {};
    }
};

export const subscribeToSocioMembershipsStatus = async (callback, socioId) => {
    try {
        if (!auth.currentUser) throw new Error('No hay usuario autenticado');

        const userQuery = query(
            collection(db, 'users'),
            where('socioId', '==', socioId),
            where('role', '==', 'user')
        );
        const investmentsRef = collection(db, 'investments');

        const unsubscribe = onSnapshot(query(investmentsRef), async (investmentsSnapshot) => {
            const userIds = (await getDocs(userQuery)).docs.map(doc => doc.id);
            const stats = {
                membershipStatus: { active: 0, inactive: 0 },
                planCounts: { basico: 0, estandar: 0, pro: 0 }
            };

            investmentsSnapshot.forEach((doc) => {
                const investment = doc.data();
                if (investment.status === 'approved' && userIds.includes(investment.userId)) {
                    const expirationDate = investment.expirationDate?.toDate();
                    const now = new Date();

                    if (expirationDate && expirationDate > now) {
                        stats.membershipStatus.active++;
                        // Normalizar el nombre del plan
                        const planKey = investment.planName?.toLowerCase()
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
                            .replace(/plan /i, '') // Eliminar la palabra "plan"
                            .trim();

                        if (planKey === 'basico') stats.planCounts.basico++;
                        else if (planKey === 'estandar') stats.planCounts.estandar++;
                        else if (planKey === 'pro') stats.planCounts.pro++;
                    } else {
                        stats.membershipStatus.inactive++;
                    }
                }
            });

            callback(stats);
        });

        return unsubscribe;
    } catch (error) {
        logError('Error en suscripción de estado de membresías:', error.message);
        callback({
            membershipStatus: { active: 0, inactive: 0 },
            planCounts: { basico: 0, estandar: 0, pro: 0 }
        });
        return () => {};
    }
};

export const subscribeToSocioReferrals = async (callback, socioId) => {
    try {
        if (!auth.currentUser) throw new Error('No hay usuario autenticado');

        const referralQuery = query(
            collection(db, 'referralCodes'),
            where('userId', '==', socioId),
            where('role', '==', 'socio')
        );

        const unsubscribe = onSnapshot(referralQuery, (snapshot) => {
            let totalReferidos = 0;
            let earnings = 0;

            if (!snapshot.empty) {
                const referralDoc = snapshot.docs[0].data();
                totalReferidos = referralDoc.usedCount || 0;
                earnings = referralDoc.earnings || 0;
            }

            callback({
                referred: totalReferidos,
                earnings: earnings
            });
        });

        return unsubscribe;
    } catch (error) {
        logError('Error en suscripción de referidos:', error.message);
        callback({ referred: 0, earnings: 0 });
        return () => {};
    }
};