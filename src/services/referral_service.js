import { db, auth } from '@/services/firebase_config';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { logError, logInfo } from '@/utils/logger';

export const referralService = {
    async createReferralCode(userId) {
        try {
            // Verificar si el usuario ya tiene un código
            const existingCodeQuery = query(
                collection(db, 'referralCodes'),
                where('userId', '==', userId)
            );
            const existingCodeSnap = await getDocs(existingCodeQuery);

            if (!existingCodeSnap.empty) {
                return existingCodeSnap.docs[0].data().code;
            }

            // Crear nuevo código
            const code = `REF${userId.slice(0, 4).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
            await addDoc(collection(db, 'referralCodes'), {
                userId,
                code,
                createdAt: new Date(),
                usedCount: 0,
                earnings: 0,
                referredUsers: []
            });

            logInfo(`Nuevo código de referido creado: ${code}`);
            return code;
        } catch (error) {
            logError('Error al crear código de referido:', error);
            throw error;
        }
    },

    async getReferralStats(userId) {
        try {
            const userRef = query(
                collection(db, 'referralCodes'),
                where('userId', '==', userId)
            );
            const snapshot = await getDocs(userRef);

            if (snapshot.empty) {
                return {
                    code: null,
                    totalReferrals: 0,
                    earnings: 0
                };
            }

            const data = snapshot.docs[0].data();
            return {
                code: data.code,
                totalReferrals: data.usedCount,
                earnings: data.earnings
            };
        } catch (error) {
            logError('Error al obtener estadísticas:', error);
            throw error;
        }
    },

    async processReferral(referralCode, newUserId) {
        try {
            const q = query(
                collection(db, 'referralCodes'),
                where('code', '==', referralCode)
            );
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                logError('Código de referido inválido');
                return false;
            }

            const referralDoc = snapshot.docs[0];
            const referralData = referralDoc.data();

            // Actualizar estadísticas del referidor
            await updateDoc(doc(db, 'referralCodes', referralDoc.id), {
                usedCount: referralData.usedCount + 1,
                earnings: referralData.earnings + 10,
                referredUsers: [...referralData.referredUsers, newUserId]
            });

            // Registrar la relación de referido
            await addDoc(collection(db, 'userReferrals'), {
                referredUserId: newUserId,
                referrerId: referralData.userId,
                referralCode: referralCode,
                date: new Date(),
                status: 'active'
            });

            logInfo(`Referido procesado exitosamente: ${newUserId}`);
            return true;
        } catch (error) {
            logError('Error al procesar referido:', error);
            throw error;
        }
    },

    async getReferrerInfo(userId) {
        try {
            const userReferralsQuery = query(
                collection(db, 'userReferrals'),
                where('referredUserId', '==', userId)
            );

            const referralSnapshot = await getDocs(userReferralsQuery);

            if (referralSnapshot.empty) {
                return { nombre: 'DinnerMax' };
            }

            const referralData = referralSnapshot.docs[0].data();
            const referrerDoc = await getDoc(doc(db, 'users', referralData.referrerId));

            if (referrerDoc.exists()) {
                return {
                    nombre: referrerDoc.data().nombre,
                    id: referralData.referrerId
                };
            }
            return { nombre: 'DinnerMax' };
        } catch (error) {
            logError('Error al obtener información del referidor:', error);
            return { nombre: 'DinnerMax' };
        }
    }
};