import { collection, query, getDocs, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/services/firebase_config';
import { logError, logInfo } from '@/utils/logger';
import SecureLS from 'secure-ls';

const ls = new SecureLS({ encodingType: 'aes' });

export const subscribeToUsersList = async (callback, planFilter = 'all') => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error('No hay usuario autenticado');

        const userRole = ls.get('user_role');
        logInfo('Usuario actual ID:', currentUser.uid);
        logInfo('Rol del usuario:', userRole);

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

                let shouldIncludeUser = false;

                if (userRole === 'socio') {
                    shouldIncludeUser = userData.socioId === currentUser.uid;
                } else if (userRole === 'admin') {
                    shouldIncludeUser = !userData.socioId && userData.role === 'user';
                }

                if (shouldIncludeUser) {
                    switch (planFilter) {
                        case 'with-plan':
                            if (hasApprovedPlan) usersData.push(userData);
                            break;
                        case 'without-plan':
                            if (!hasApprovedPlan) usersData.push(userData);
                            break;
                        default: // 'all'
                            usersData.push(userData);
                    }
                }
            });

            logInfo('Total usuarios filtrados:', usersData.length);
            callback(usersData);
        }, (error) => {
            logError('Error en la suscripción de usuarios: ' + error.message);
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

export const subscribeToTotalInvestments = (callback) => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error('No hay usuario autenticado');

        const userRole = ls.get('user_role');
        logInfo('Iniciando suscripción a inversiones totales para rol:', userRole);

        const investmentsRef = collection(db, 'investments');
        const usersRef = collection(db, 'users');

        const unsubscribe = onSnapshot(query(investmentsRef), async (investmentsSnapshot) => {
            const usersSnapshot = await getDocs(query(usersRef));
            const validUserIds = new Set();

            // Primero, obtener los IDs de usuarios válidos según el rol
            usersSnapshot.forEach((userDoc) => {
                const userData = userDoc.data();
                if (userRole === 'socio' && userData.socioId === currentUser.uid) {
                    validUserIds.add(userDoc.id);
                } else if (userRole === 'admin' && !userData.socioId && userData.role === 'user') {
                    validUserIds.add(userDoc.id);
                }
            });

            // Calcular el total de inversiones solo para usuarios válidos
            let totalInvestments = 0;
            investmentsSnapshot.forEach(doc => {
                const investment = doc.data();
                if (investment.status === 'approved' && validUserIds.has(investment.userId)) {
                    totalInvestments += Number(investment.investment || 0);
                }
            });

            const roundedTotal = Number(totalInvestments.toFixed(2));
            logInfo('Total de inversiones calculado:', roundedTotal);
            callback(roundedTotal);
        }, (error) => {
            logError('Error en la suscripción de inversiones totales:', error);
        });

        return unsubscribe;
    } catch (error) {
        logError('Error al crear suscripción de inversiones totales:', error);
        throw error;
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