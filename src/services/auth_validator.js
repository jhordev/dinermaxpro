import { auth } from '@/services/firebase_config';
import { logError } from '@/utils/logger';

export const validateAuth = () => {
    const user = auth.currentUser;
    if (!user) {
        logError('Usuario no autenticado');
        throw new Error('Usuario no autenticado');
    }
    return user.uid;
};

export const waitForAuth = () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            if (user) {
                resolve(user.uid);
            } else {
                reject(new Error('Usuario no autenticado'));
            }
        });
    });
};