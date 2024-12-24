import { db, storage } from '@/services/firebase_config';
import {
    collection,
    addDoc,
    serverTimestamp,
    onSnapshot,
    query,
    orderBy,
    doc,
    updateDoc,
    getDoc,
    where,
    getDocs
} from 'firebase/firestore';
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

    subscribeToInvestments(callback) {
        const q = query(collection(db, 'investments'), orderBy('createdAt', 'desc'));
        return onSnapshot(q, (snapshot) => {
            const investments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(investments);
        });
    },

    async updateInvestmentStatus(investmentId, newStatus) {
        try {
            const investmentRef = doc(db, 'investments', investmentId);
            const investmentDoc = await getDoc(investmentRef);
            const investmentData = investmentDoc.data();

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

            // Verificar si ya pasó la fecha de expiración
            const expirationDate = investment.expirationDate.toDate();
            if (now > expirationDate) {
                logDebug(`Inversión ${investmentId} ha expirado`);
                return;
            }

            // Calcular días hábiles
            let businessDays = 0;
            const current = new Date(startDate);

            while (current <= now) {
                const day = current.getDay();
                if (day !== 0 && day !== 6) {
                    businessDays++;
                }
                current.setDate(current.getDate() + 1);
            }

            // Calcular ganancias
            const dailyRate = investment.interestRate / 100;
            const dailyEarnings = investment.investment * dailyRate;
            const totalEarnings = Number((dailyEarnings * businessDays).toFixed(2));

            // Actualizar solo si las ganancias han cambiado
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

    async updateAllActiveInvestments() {
        try {
            const q = query(
                collection(db, 'investments'),
                where('status', '==', 'approved')
            );

            const snapshot = await getDocs(q);
            const updatePromises = snapshot.docs.map(doc =>
                this.updateEarnings(doc.id)
            );

            await Promise.all(updatePromises);
            logInfo('Todas las inversiones activas han sido actualizadas');
        } catch (error) {
            logError('Error al actualizar todas las inversiones:', error);
            throw error;
        }
    },
};