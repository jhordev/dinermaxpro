import { db } from '@/services/firebase_config';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { logError, logInfo } from '@/utils/logger';

export const referralService = {
    async createReferralCode(userId, role = 'user') {
        try {
            const existingCodeQuery = query(
                collection(db, 'referralCodes'),
                where('userId', '==', userId)
            );
            const existingCodeSnap = await getDocs(existingCodeQuery);

            if (!existingCodeSnap.empty) {
                return existingCodeSnap.docs[0].data().code;
            }

            const prefix = role === 'socio' ? 'SOC' : 'REF';
            const code = `${prefix}${userId.slice(0, 4).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

            await addDoc(collection(db, 'referralCodes'), {
                userId,
                code,
                role,
                createdAt: new Date(),
                usedCount: 0,
                earnings: 0,
                referredUsers: []
            });

            logInfo(`Nuevo código de referido creado: ${code} para rol: ${role}`);
            return code;
        } catch (error) {
            logError('Error al crear código de referido:', error);
            throw error;
        }
    },

    async getSocioIdFromReferralCode(referralCode) {
        try {
            const q = query(
                collection(db, 'referralCodes'),
                where('code', '==', referralCode)
            );
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return null;
            }

            const referralData = snapshot.docs[0].data();

            // Si el referidor es socio, devolver su ID
            if (referralData.role === 'socio') {
                return referralData.userId;
            }

            // Si no es socio, buscar en users para encontrar el socioId
            const userRef = await getDoc(doc(db, 'users', referralData.userId));
            if (userRef.exists()) {
                const userData = userRef.data();
                return userData.socioId || null;
            }

            return null;
        } catch (error) {
            logError('Error al obtener socioId desde código de referido:', error);
            return null;
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
                logError(`Código de referido inválido: ${referralCode}`);
                return false;
            }

            const referralDoc = snapshot.docs[0];
            const referralData = referralDoc.data();
            const bonus = referralData.role === 'socio' ? 20 : 10;

            // Obtener información del usuario que refiere
            const referrerDoc = await getDoc(doc(db, 'users', referralData.userId));
            let socioIdToAssign = null;

            if (referrerDoc.exists()) {
                const referrerData = referrerDoc.data();
                // Verificar si el usuario que refiere tiene socioId
                if (referrerData.socioId) {
                    socioIdToAssign = referrerData.socioId;
                    // Actualizar el documento del nuevo usuario con el socioId heredado
                    await updateDoc(doc(db, 'users', newUserId), {
                        socioId: socioIdToAssign
                    });
                    logInfo(`SocioId heredado: ${socioIdToAssign} para usuario ${newUserId}`);
                }
            }

            // Actualizar el documento de referralCodes
            await updateDoc(doc(db, 'referralCodes', referralDoc.id), {
                usedCount: (referralData.usedCount || 0) + 1,
                earnings: (referralData.earnings || 0) + bonus,
                referredUsers: [...(referralData.referredUsers || []), newUserId]
            });

            // Crear registro en userReferrals
            await addDoc(collection(db, 'userReferrals'), {
                referredUserId: newUserId,
                referrerId: referralData.userId,
                referralCode: referralCode,
                referrerRole: referralData.role,
                date: new Date(),
                status: 'active',
                bonus,
                socioId: socioIdToAssign
            });

            logInfo(`Referido procesado exitosamente: Usuario ${newUserId} con código ${referralCode}`);
            return true;
        } catch (error) {
            logError(`Error al procesar referido: ${error.message}`);
            throw error;
        }
    },

    getReferralStats(userId, callback) {
        try {
            const referredQuery = query(
                collection(db, 'referralCodes'),
                where('referredUsers', 'array-contains', userId)
            );

            const userQuery = query(
                collection(db, 'referralCodes'),
                where('userId', '==', userId)
            );

            const unsubscribe = onSnapshot(referredQuery, async (referredSnapshot) => {
                try {
                    let referrerData = {
                        userId: null,
                        nombre: 'DinnerMax',
                        photoURL: null
                    };
                    let ownReferralData = null;

                    if (!referredSnapshot.empty) {
                        const referralDoc = referredSnapshot.docs[0];
                        const referrerUserId = referralDoc.data().userId;

                        const referrerDoc = await getDoc(doc(db, 'users', referrerUserId));
                        if (referrerDoc.exists()) {
                            referrerData = {
                                userId: referrerUserId,
                                nombre: referrerDoc.data().nombre || 'DinnerMax',
                                photoURL: referrerDoc.data().photoURL || null
                            };
                        }
                    }

                    const ownReferralSnapshot = await getDocs(userQuery);
                    if (!ownReferralSnapshot.empty) {
                        const data = ownReferralSnapshot.docs[0].data();

                        const referredUsersInfo = [];
                        if (data.referredUsers && data.referredUsers.length > 0) {
                            for (const referredUserId of data.referredUsers) {
                                const userDoc = await getDoc(doc(db, 'users', referredUserId));
                                if (userDoc.exists()) {
                                    const userData = userDoc.data();
                                    referredUsersInfo.push({
                                        userId: referredUserId,
                                        nombre: userData.nombre || 'Usuario Desconocido',
                                        photoURL: userData.photoURL || null,
                                        fechaRegistro: userData.created_at || null
                                    });
                                }
                            }
                        }

                        ownReferralData = {
                            code: data.code,
                            totalReferrals: data.usedCount || 0,
                            earnings: data.earnings || 0,
                            role: data.role || 'user',
                            referredUsers: referredUsersInfo
                        };
                    }

                    callback({
                        referrer: referrerData,
                        ownReferral: ownReferralData || {
                            code: null,
                            totalReferrals: 0,
                            earnings: 0,
                            role: 'user',
                            referredUsers: []
                        }
                    });

                    logInfo('Datos de referidos actualizados en tiempo real');
                } catch (error) {
                    logError('Error procesando datos de referidos:', error);
                    callback({
                        referrer: {
                            userId: null,
                            nombre: 'DinnerMax',
                            photoURL: null
                        },
                        ownReferral: {
                            code: null,
                            totalReferrals: 0,
                            earnings: 0,
                            role: 'user',
                            referredUsers: []
                        }
                    });
                }
            }, (error) => {
                logError('Error en la suscripción de referidos:', error);
            });

            return unsubscribe;
        } catch (error) {
            logError('Error al configurar la suscripción de referidos:', error);
            throw error;
        }
    }
};