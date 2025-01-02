import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '@/services/firebase_config';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { logError, logInfo, logDebug } from '@/utils/logger';

const functions = getFunctions();

export const createSocioUser = async (userData) => {
    try {
        logDebug('Iniciando creación de usuario socio');
        const createUserFunction = httpsCallable(functions, 'createSocioUser');
        const result = await createUserFunction(userData);
        return result.data;
    } catch (error) {
        logError('Error al crear usuario socio:', error);
        throw error;
    }
};

export const updateSocioUser = async (userData) => {
    try {
        logDebug('Iniciando actualización de usuario socio');
        const updateUserFunction = httpsCallable(functions, 'updateSocioUser');
        const result = await updateUserFunction(userData);
        logInfo('Usuario socio actualizado exitosamente');
        return result.data;
    } catch (error) {
        logError('Error al actualizar usuario socio:', error);
        throw error;
    }
};

export const updateSocioStatus = async (socioId, newStatus) => {
    try {
        logDebug(`Actualizando estado del socio ${socioId} a ${newStatus}`);
        const userRef = doc(db, 'users', socioId);
        await updateDoc(userRef, {
            estado: newStatus
        });
        logInfo(`Estado del socio ${socioId} actualizado correctamente a ${newStatus}`);
        return true;
    } catch (error) {
        logError('Error al actualizar estado del socio:', error);
        throw error;
    }
};

export const subscribeToSocios = (callback) => {
    try {
        logDebug('Iniciando suscripción a lista de socios');
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', 'socio'));

        return onSnapshot(q, (snapshot) => {
            const socios = [];
            snapshot.forEach((doc) => {
                socios.push({ id: doc.id, ...doc.data() });
            });
            logInfo(`Lista de socios actualizada: ${socios.length} socios encontrados`);
            callback(socios);
        }, (error) => {
            logError('Error en la suscripción de socios:', error);
            callback([]);
        });
    } catch (error) {
        logError('Error al configurar la suscripción de socios:', error);
        throw error;
    }
};