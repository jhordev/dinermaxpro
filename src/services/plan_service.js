// services/plan_service.js
import { db } from '@/services/firebase_config';
import {collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy} from 'firebase/firestore';
import { logError, logInfo } from '@/utils/logger.js';

const COLLECTION_NAME = 'planes';

export const planService = {
    subscribeToPlanes(callback) {
        try {
            const planesQuery = query(
                collection(db, COLLECTION_NAME),
                orderBy('capitalMinimo', 'asc')
            );

            const unsubscribe = onSnapshot(planesQuery, (snapshot) => {
                const planes = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                callback(planes);
                logInfo('Planes actualizados en tiempo real');
            }, (error) => {
                logError('Error en la suscripción de planes:', error);
            });

            return unsubscribe;
        } catch (error) {
            logError('Error al suscribirse a planes:', error);
            throw error;
        }
    },

    async crearPlan(planData) {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...planData,
                porcentajeMinRetiro: Number(planData.porcentajeMinRetiro),
                createdAt: new Date()
            });
            logInfo('Plan creado exitosamente');
            return {
                id: docRef.id,
                ...planData
            };
        } catch (error) {
            logError('Error al crear plan:', error);
            throw error;
        }
    },

    async actualizarPlan(id, planData) {
        try {
            const planRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(planRef, {
                ...planData,
                porcentajeMinRetiro: Number(planData.porcentajeMinRetiro),
                updatedAt: new Date()
            });
            logInfo('Plan actualizado exitosamente');
            return {
                id,
                ...planData
            };
        } catch (error) {
            logError('Error al actualizar plan:', error);
            throw error;
        }
    },

    async eliminarPlan(id) {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id));
            logInfo('Plan eliminado exitosamente');
        } catch (error) {
            logError('Error al eliminar plan:', error);
            throw error;
        }
    }
};