import { collection, query, getDocs, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/services/firebase_config';
import { logError, logInfo } from '@/utils/logger';
import SecureLS from 'secure-ls';

const ls = new SecureLS({ encodingType: 'aes' });

export const subscribeToUsersList = async (callback, showAllData = false) => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error('No hay usuario autenticado');

        const userRole = ls.get('user_role');
        const usersRef = collection(db, 'users');
        const investmentsRef = collection(db, 'investments');

        const unsubscribe = onSnapshot(query(usersRef), async (snapshot) => {
            const usersData = [];
            const investmentsSnapshot = await getDocs(query(investmentsRef));
            const investmentsMap = new Map();

            investmentsSnapshot.forEach((doc) => {
                const investment = doc.data();
                if (investment.status === 'approved') {
                    investmentsMap.set(investment.userId, investment);
                }
            });

            snapshot.forEach((doc) => {
                const userData = { id: doc.id, ...doc.data() };
                const hasApprovedPlan = investmentsMap.has(doc.id);
                userData.hasActivePlan = hasApprovedPlan;

                if (showAllData) {
                    // Si showAllData es true, incluir solo usuarios con role 'user'
                    if (userData.role === 'user') {
                        usersData.push(userData);
                    }
                } else {
                    // Lógica original de filtrado
                    if (userRole === 'socio' && userData.socioId === currentUser.uid) {
                        usersData.push(userData);
                    } else if (userRole === 'admin' && !userData.socioId && userData.role === 'user') {
                        usersData.push(userData);
                    }
                }
            });

            logInfo('Total usuarios filtrados:', usersData.length);
            callback(usersData);
        });

        return unsubscribe;
    } catch (error) {
        logError('Error al crear suscripción de usuarios: ' + error.message);
        throw error;
    }
};

export const subscribeToUserInvestment = (userId, callback) => {
    try {
        if (!userId) throw new Error('ID de usuario es requerido');
        logInfo('Iniciando suscripción a inversión del usuario:', userId);

        const investmentsRef = collection(db, 'investments');

        const unsubscribe = onSnapshot(
            query(investmentsRef),
            (snapshot) => {
                let investmentData = null;

                snapshot.forEach((doc) => {
                    const investment = doc.data();
                    if (investment.userId === userId && investment.status === 'approved') {
                        investmentData = {
                            id: doc.id,
                            ...investment,
                            // Calculamos el progreso para el gráfico
                            progress: calculateProgress(investment.activationDate, investment.expirationDate)
                        };
                    }
                });

                callback(investmentData);
            },
            (error) => {
                logError('Error en la suscripción de inversión: ' + error.message);
            }
        );

        return unsubscribe;
    } catch (error) {
        logError('Error al crear suscripción de inversión: ' + error.message);
        throw error;
    }
};

export const subscribeToTotalInvestments = (callback, showAllData = false) => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error('No hay usuario autenticado');

        const userRole = ls.get('user_role');
        const investmentsRef = collection(db, 'investments');
        const usersRef = collection(db, 'users');

        const unsubscribe = onSnapshot(query(investmentsRef), async (investmentsSnapshot) => {
            if (showAllData) {
                // Si showAllData es true, sumar todas las inversiones aprobadas
                let totalInvestments = 0;
                investmentsSnapshot.forEach(doc => {
                    const investment = doc.data();
                    if (investment.status === 'approved') {
                        totalInvestments += Number(investment.investment || 0);
                    }
                });
                callback(Number(totalInvestments.toFixed(2)));
            } else {
                // Lógica original de filtrado
                const usersSnapshot = await getDocs(query(usersRef));
                const validUserIds = new Set();

                usersSnapshot.forEach((userDoc) => {
                    const userData = userDoc.data();
                    if (userRole === 'socio' && userData.socioId === currentUser.uid) {
                        validUserIds.add(userDoc.id);
                    } else if (userRole === 'admin' && !userData.socioId && userData.role === 'user') {
                        validUserIds.add(userDoc.id);
                    }
                });

                let totalInvestments = 0;
                investmentsSnapshot.forEach(doc => {
                    const investment = doc.data();
                    if (investment.status === 'approved' && validUserIds.has(investment.userId)) {
                        totalInvestments += Number(investment.investment || 0);
                    }
                });

                callback(Number(totalInvestments.toFixed(2)));
            }
        });

        return unsubscribe;
    } catch (error) {
        logError('Error al crear suscripción de inversiones totales:', error);
        throw error;
    }
};

export const subscribeToMembershipsStatus = (callback, showAllData = false) => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error('No hay usuario autenticado');

        const userRole = ls.get('user_role');
        const investmentsRef = collection(db, 'investments');
        const usersRef = collection(db, 'users');

        const unsubscribe = onSnapshot(query(investmentsRef), async (investmentsSnapshot) => {
            try {
                const usersSnapshot = await getDocs(query(usersRef));
                const validUserIds = new Set();

                // Obtener IDs de usuarios válidos según el rol y showAllData
                if (showAllData) {
                    usersSnapshot.forEach((userDoc) => {
                        validUserIds.add(userDoc.id);
                    });
                } else {
                    usersSnapshot.forEach((userDoc) => {
                        const userData = userDoc.data();
                        if (userRole === 'socio' && userData.socioId === currentUser.uid) {
                            validUserIds.add(userDoc.id);
                        } else if (userRole === 'admin' && !userData.socioId && userData.role === 'user') {
                            validUserIds.add(userDoc.id);
                        }
                    });
                }

                let active = 0;
                let inactive = 0;

                investmentsSnapshot.forEach((doc) => {
                    const investment = doc.data();
                    if (investment.status === 'approved' && validUserIds.has(investment.userId)) {
                        if (investment.expirationDate && investment.expirationDate.seconds) {
                            const expirationDate = new Date(investment.expirationDate.seconds * 1000);
                            const now = new Date();
                            if (expirationDate > now) {
                                active++;
                            } else {
                                inactive++;
                            }
                        } else {
                            inactive++;
                        }
                    }
                });

                logInfo(`Membresías activas: ${active}, Membresías inactivas: ${inactive}`);
                callback({ active, inactive });
            } catch (error) {
                logError('Error al procesar datos de membresías:', error);
                callback({ active: 0, inactive: 0 });
            }
        });

        return unsubscribe;
    } catch (error) {
        logError('Error al suscribirse a estado de membresías:', error);
        callback({ active: 0, inactive: 0 });
        return () => {};
    }
};

export const subscribeToActivePlansByType = (callback, showAllData = false) => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error('No hay usuario autenticado');

        const userRole = ls.get('user_role');
        const investmentsRef = collection(db, 'investments');
        const usersRef = collection(db, 'users');

        const unsubscribe = onSnapshot(query(investmentsRef), async (investmentsSnapshot) => {
            try {
                const usersSnapshot = await getDocs(query(usersRef));
                const validUserIds = new Set();
                const planCounts = new Map();

                // Obtener IDs de usuarios válidos según el rol y showAllData
                if (showAllData) {
                    usersSnapshot.forEach((userDoc) => {
                        validUserIds.add(userDoc.id);
                    });
                } else {
                    usersSnapshot.forEach((userDoc) => {
                        const userData = userDoc.data();
                        if (userRole === 'socio' && userData.socioId === currentUser.uid) {
                            validUserIds.add(userDoc.id);
                        } else if (userRole === 'admin' && !userData.socioId && userData.role === 'user') {
                            validUserIds.add(userDoc.id);
                        }
                    });
                }

                // Contar planes activos por tipo
                investmentsSnapshot.forEach((doc) => {
                    const investment = doc.data();
                    if (investment.status === 'approved' && validUserIds.has(investment.userId)) {
                        if (investment.expirationDate && investment.expirationDate.seconds) {
                            const expirationDate = new Date(investment.expirationDate.seconds * 1000);
                            const now = new Date();

                            if (expirationDate > now) {
                                const count = planCounts.get(investment.planName) || 0;
                                planCounts.set(investment.planName, count + 1);
                            }
                        }
                    }
                });

                const chartData = {
                    labels: Array.from(planCounts.keys()),
                    data: Array.from(planCounts.values())
                };

                logInfo('Distribución de planes activos:', Object.fromEntries(planCounts));
                callback(chartData);
            } catch (error) {
                logError('Error al procesar datos de planes:', error);
                callback({ labels: [], data: [] });
            }
        });

        return unsubscribe;
    } catch (error) {
        logError('Error al suscribirse a planes activos:', error);
        callback({ labels: [], data: [] });
        return () => {};
    }
};

export const updateUserStatus = async (userId, estado) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            estado: estado ? 'activo' : 'inactivo'
        });

        logInfo(`Estado del usuario ${userId} actualizado a: ${estado ? 'activo' : 'inactivo'}`);
        return {
            success: true,
            message: 'Estado actualizado correctamente'
        };
    } catch (error) {
        logError(`Error al actualizar estado del usuario: ${error.message}`);
        return {
            success: false,
            error: 'Error al actualizar el estado del usuario'
        };
    }
};

const calculateProgress = (activationDate, expirationDate) => {
    const start = new Date(activationDate.seconds * 1000);
    const end = new Date(expirationDate.seconds * 1000);
    const now = new Date();

    const totalDays = (end - start) / (1000 * 60 * 60 * 24);
    const daysElapsed = (now - start) / (1000 * 60 * 60 * 24);

    const progress = Math.round((daysElapsed / totalDays) * 100);
    return Math.min(Math.max(progress, 0), 100);
};