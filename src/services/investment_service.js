import { db, storage } from '@/services/firebase_config';
import {collection, addDoc, serverTimestamp, onSnapshot, query,
    orderBy, doc, updateDoc, getDoc, where, getDocs, increment} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { logInfo, logError, logDebug } from '@/utils/logger.js';

export const investmentService = {
    async createInvestment(investmentData, voucherFile) {
        try {
            let voucherUrl = '';
            if (voucherFile) {
                const fileRef = storageRef(storage, `vouchers/${Date.now()}_${voucherFile.name}`);
                await uploadBytes(fileRef, voucherFile);
                voucherUrl = await getDownloadURL(fileRef);
                logInfo('Voucher subido exitosamente');
            }

            const investmentDoc = {
                ...investmentData,
                voucherUrl,
                status: 'pending',
                earnings: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                expirationDate: null,
                activationDate: null
            };

            const docRef = await addDoc(collection(db, 'investments'), investmentDoc);
            logInfo('Inversión creada exitosamente');
            return docRef.id;
        } catch (error) {
            logError('Error al crear la inversión:', error);
            throw error;
        }
    },

    async getUserDataForInvestment(userId) {
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            return userSnap.exists() ? userSnap.data() : null;
        } catch (error) {
            logError('Error al obtener datos del usuario:', error);
            throw error;
        }
    },

    subscribeToInvestments(callback, userRole, socioId = null) {
        const q = query(collection(db, 'investments'), orderBy('createdAt', 'desc'));

        return onSnapshot(q, async (snapshot) => {
            try {
                const investments = await Promise.all(
                    snapshot.docs.map(async (doc) => {
                        const investment = { id: doc.id, ...doc.data() };
                        const userData = await this.getUserDataForInvestment(investment.userId);

                        // Filtrar según el rol
                        if (userRole === 'socio' && userData?.socioId !== socioId) {
                            return null;
                        }
                        if (userRole === 'admin' && userData?.socioId) {
                            return null;
                        }

                        return investment;
                    })
                );

                // Filtrar los nulos y enviar solo las inversiones válidas
                callback(investments.filter(inv => inv !== null));
            } catch (error) {
                logError('Error al procesar inversiones:', error);
            }
        });
    },

    async updateInvestmentStatus(investmentId, newStatus) {
        try {
            const investmentRef = doc(db, 'investments', investmentId);
            const investmentDoc = await getDoc(investmentRef);
            const investmentData = { ...investmentDoc.data(), id: investmentId };

            const updateData = {
                status: newStatus,
                updatedAt: serverTimestamp()
            };

            if (newStatus === 'approved') {
                const duration = parseInt(investmentData.duration);
                const today = new Date();
                const expirationDate = new Date(today);
                expirationDate.setMonth(today.getMonth() + duration);
                expirationDate.setHours(23, 59, 59, 999);

                updateData.expirationDate = expirationDate;
                updateData.activationDate = today;
                updateData.earnings = 0;

                await this.processReferralBonus(investmentData);
            }

            await updateDoc(investmentRef, updateData);
            logInfo('Estado de inversión actualizado exitosamente');

            if (newStatus === 'approved') {
                await this.updateEarnings(investmentId);
            }
        } catch (error) {
            logError('Error al actualizar estado de inversión:', error);
            throw error;
        }
    },

    async processReferralBonus(investmentData) {
        try {
            const referralCodesRef = collection(db, 'referralCodes');
            const q = query(referralCodesRef,
                where('referredUsers', 'array-contains', investmentData.userId)
            );
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                logDebug('Usuario no fue referido');
                return;
            }

            const settingsRef = doc(db, 'system/settings');
            const settingsDoc = await getDoc(settingsRef);
            const referralPercentage = settingsDoc.data().referral;

            const referralDoc = querySnapshot.docs[0];
            const bonus = (investmentData.investment * referralPercentage) / 100;

            // Actualizar directamente earnings en referralCodes
            await updateDoc(doc(db, 'referralCodes', referralDoc.id), {
                earnings: increment(bonus),
                updatedAt: serverTimestamp()
            });

            await addDoc(collection(db, 'referralHistory'), {
                referralCodeId: referralDoc.id,
                referrerId: referralDoc.data().userId,
                referredUserId: investmentData.userId,
                investmentId: investmentData.id,
                planName: investmentData.planName,
                investmentAmount: investmentData.investment,
                percentage: referralPercentage,
                earnedAmount: bonus,
                createdAt: serverTimestamp()
            });

            logInfo(`Bono de referido procesado: ${bonus} para código ${referralDoc.id}`);
        } catch (error) {
            logError('Error al procesar bono de referido:', error);
            throw error;
        }
    },

    async updateEarnings(investmentId) {
        try {
            const investmentRef = doc(db, 'investments', investmentId);
            const investmentDoc = await getDoc(investmentRef);

            if (!investmentDoc.exists()) {
                throw new Error('Inversión no encontrada');
            }

            const investment = investmentDoc.data();

            if (investment.status !== 'approved') {
                logDebug(`Inversión ${investmentId} no está aprobada`);
                return;
            }

            const activationDate = investment.activationDate.toDate();
            const now = new Date();
            const startDate = new Date(activationDate);
            startDate.setDate(startDate.getDate() + 1);
            startDate.setHours(0, 0, 0, 0);

            if (now < startDate) {
                logDebug(`Aún no es tiempo de calcular ganancias para inversión ${investmentId}`);
                return;
            }

            const expirationDate = investment.expirationDate.toDate();
            if (now > expirationDate) {
                logDebug(`Inversión ${investmentId} ha expirado`);
                return;
            }

            let businessDays = 0;
            const current = new Date(startDate);

            while (current <= now) {
                const day = current.getDay();
                if (day !== 0 && day !== 6) {
                    businessDays++;
                }
                current.setDate(current.getDate() + 1);
            }

            const dailyRate = investment.interestRate / 100;
            const dailyEarnings = investment.investment * dailyRate;
            const totalEarnings = Number((dailyEarnings * businessDays).toFixed(2));

            if (totalEarnings !== investment.earnings) {
                await updateDoc(investmentRef, {
                    earnings: totalEarnings,
                    updatedAt: serverTimestamp()
                });
                logInfo(`Ganancias actualizadas para inversión ${investmentId}: $${totalEarnings}`);
            }

            return totalEarnings;
        } catch (error) {
            logError('Error al actualizar ganancias:', error);
            throw error;
        }
    },

    async getConfiguracion() {
        try {
            const configRef = doc(db, 'system', 'settings');
            const configSnap = await getDoc(configRef);

            if (configSnap.exists()) {
                const data = configSnap.data();
                // Validar que los campos existan y sean números
                const requiredFields = ['minimumWithdrawal', 'referral', 'withdrawal'];
                const isValid = requiredFields.every(field =>
                    typeof data[field] === 'number' && !isNaN(data[field])
                );

                return isValid ? data : null;
            }
            return null;
        } catch (error) {
            logError('Error al obtener la configuración:', error);
            throw error;
        }
    }
};