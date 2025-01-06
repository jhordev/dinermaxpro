import { db } from '@/services/firebase_config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { logInfo, logError } from '@/utils/logger.js';

const COLLECTION_NAME = 'system';
const DOCUMENT_NAME = 'settings';

export const getSystemSettings = async () => {
    try {
        const settingsDoc = await getDoc(doc(db, COLLECTION_NAME, DOCUMENT_NAME));
        if (settingsDoc.exists()) {
            logInfo('Configuración del sistema obtenida exitosamente');
            return settingsDoc.data();
        }
        return { withdrawal: 0, referral: 0, minimumWithdrawal: 0 };
    } catch (error) {
        logError('Error al obtener la configuración del sistema:', error);
        throw error;
    }
};

export const updateSystemSettings = async (withdrawalPercentage, referralPercentage, minimumWithdrawal) => {
    try {
        await setDoc(doc(db, COLLECTION_NAME, DOCUMENT_NAME), {
            withdrawal: Number(withdrawalPercentage),
            referral: Number(referralPercentage),
            minimumWithdrawal: Number(minimumWithdrawal)
        });
        logInfo('Configuración del sistema actualizada exitosamente');
        return true;
    } catch (error) {
        logError('Error al actualizar la configuración del sistema:', error);
        throw error;
    }
};