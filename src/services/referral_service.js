import { db } from '@/services/firebase_config';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, getDoc, onSnapshot, limit } from 'firebase/firestore';
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
                referredUsers: []
            });

            logInfo(`Nuevo código de referido creado: ${code} para rol: ${role}`);
            return code;
        } catch (error) {
            logError('Error al crear código de referido:', error);
            throw error;
        }
    },

    getReferralHistory(referrerId, callback) {
        try {
            const referralCodesQuery = query(
                collection(db, 'referralCodes'),
                where('userId', '==', referrerId)
            );

            const unsubscribe = onSnapshot(referralCodesQuery, async (referralCodesSnapshot) => {
                try {
                    const referralData = [];

                    for (const referralCodeDoc of referralCodesSnapshot.docs) {
                        const referralCodeData = referralCodeDoc.data();
                        const referredUsers = referralCodeData.referredUsers || [];

                        for (const referredUserId of referredUsers) {
                            const userDoc = await getDoc(doc(db, 'users', referredUserId));

                            if (userDoc.exists()) {
                                const userData = userDoc.data();

                                const historyQuery = query(
                                    collection(db, 'referralHistory'),
                                    where('referrerId', '==', referrerId),
                                    where('referredUserId', '==', referredUserId)
                                );

                                const historySnapshot = await getDocs(historyQuery);
                                const historyDoc = historySnapshot.docs[0];

                                // Formatear la fecha
                                const fecha = userData.createdAt?.toDate() || new Date();
                                const fechaFormateada = `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;

                                const referralInfo = {
                                    nombre: userData.nombre || 'Usuario Desconocido',
                                    fechaRegistro: fechaFormateada,
                                    haComprado: false,
                                    planContratado: 'Ninguno',
                                    ganancias: 0
                                };

                                if (historyDoc) {
                                    const historyData = historyDoc.data();
                                    referralInfo.haComprado = true;
                                    referralInfo.planContratado = historyData.planName;
                                    referralInfo.ganancias = historyData.earnedAmount;
                                }

                                referralData.push(referralInfo);
                            }
                        }
                    }

                    logInfo(`Datos de historial de referidos obtenidos: ${referralData.length} registros`);
                    callback(referralData);
                } catch (error) {
                    logError('Error procesando historial de referidos:', error);
                    callback([]);
                }
            });

            return unsubscribe;
        } catch (error) {
            logError('Error al configurar la suscripción del historial:', error);
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
                logError(`Código de referido inválido: ${referralCode}`);
                return false;
            }

            const referralDoc = snapshot.docs[0];
            const referralData = referralDoc.data();

            // Si el código comienza con SOC, asignar el userId del referente como socioId
            if (referralCode.startsWith('SOC')) {
                await updateDoc(doc(db, 'users', newUserId), {
                    socioId: referralData.userId
                });
                logInfo(`SocioId asignado directamente del socio: ${referralData.userId} para usuario ${newUserId}`);
            } else {
                // Si no es un código de socio, verificar si el referente tiene socioId
                const referrerDoc = await getDoc(doc(db, 'users', referralData.userId));
                if (referrerDoc.exists() && referrerDoc.data().socioId) {
                    await updateDoc(doc(db, 'users', newUserId), {
                        socioId: referrerDoc.data().socioId
                    });
                    logInfo(`SocioId heredado: ${referrerDoc.data().socioId} para usuario ${newUserId}`);
                }
            }

            // Actualizar el documento de referralCodes
            await updateDoc(doc(db, 'referralCodes', referralDoc.id), {
                usedCount: (referralData.usedCount || 0) + 1,
                referredUsers: [...(referralData.referredUsers || []), newUserId]
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
                            role: data.role || 'user',
                            referredUsers: referredUsersInfo,
                            earnings: data.earnings || 0
                        };
                    }

                    callback({
                        referrer: referrerData,
                        ownReferral: ownReferralData || {
                            code: null,
                            totalReferrals: 0,
                            role: 'user',
                            referredUsers: [],
                            earnings: 0
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
                            role: 'user',
                            referredUsers: [],
                            earnings: 0
                        }
                    });
                }
            });

            return unsubscribe;
        } catch (error) {
            logError('Error al configurar la suscripción de referidos:', error);
            throw error;
        }
    },

    async getReferralInfoFromCode(code) {
        try {
            // 1. Añadir limit(1) ya que solo necesitamos un resultado
            const q = query(
                collection(db, 'referralCodes'),
                where('code', '==', code),
                limit(1)
            );

            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const referralDoc = snapshot.docs[0];
                const referralData = referralDoc.data();

                // 2. Obtener datos del usuario
                const userDoc = await getDoc(doc(db, 'users', referralData.userId));

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    return {
                        socioId: referralData.userId,
                        nombre: userData.nombre,
                        role: referralData.role
                    };
                }
            }
            return null;
        } catch (error) {
            logError('Error al obtener información del referido:', error);
            return null;
        }
    }
};
