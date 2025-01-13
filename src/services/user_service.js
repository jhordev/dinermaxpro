import { auth, db, storage } from './firebase_config';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { logInfo, logError, logDebug } from '@/utils/logger.js';
import { referralService } from "@/services/referral_service.js";

export const userService = {
    subscribeToUser(callback) {
        if (!auth.currentUser) return null;

        const userRef = doc(db, 'users', auth.currentUser.uid);
        return onSnapshot(userRef,
            (doc) => {
                if (doc.exists()) {
                    callback({ success: true, data: doc.data() });
                } else {
                    callback({ success: false, error: 'Usuario no encontrado' });
                }
            },
            (error) => {
                logError(`Error en snapshot: ${error.message}`);
                callback({ success: false, error: 'Error al obtener datos' });
            }
        );
    },

    async getUserData() {
        try {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                logDebug('Datos de usuario obtenidos correctamente');
                return { success: true, data: userSnap.data() };
            }

            throw new Error('No se encontró el usuario');
        } catch (error) {
            logError(`Error al obtener datos del usuario: ${error.message}`);
            return { success: false, error: 'Error al obtener datos del usuario' };
        }
    },

    async getUserById(userId) {
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                logDebug('Datos de usuario específico obtenidos correctamente');
                return { success: true, data: userSnap.data() };
            }

            throw new Error('No se encontró el usuario');
        } catch (error) {
            logError(`Error al obtener datos del usuario: ${error.message}`);
            return { success: false, error: 'Error al obtener datos del usuario' };
        }
    },

    subscribeToUserStatus(userId, callback) {
        try {
            const userRef = doc(db, 'users', userId);
            return onSnapshot(userRef, (doc) => {
                callback(doc);
            });
        } catch (error) {
            logError(`Error en la suscripción al estado del usuario: ${error.message}`);
        }
    },

    async updateUserProfile(userData) {
        try {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            const updateData = {};

            // Solo agregar campos que no sean null
            if (userData.nombre) updateData.nombre = userData.nombre;
            if (userData.email) updateData.email = userData.email;
            if (userData.wallet) updateData.wallet = userData.wallet;
            if (userData.sexo) updateData.sexo = userData.sexo;
            if (userData.telefono) updateData.telefono = userData.telefono;
            if (userData.pais) updateData.pais = userData.pais;
            if (userData.telegram) updateData.telegram = userData.telegram;
            if (userData.whatsapp) updateData.whatsapp = userData.whatsapp;
            if (userData.instagram) updateData.instagram = userData.instagram;
            if (userData.xsocial) updateData.xsocial = userData.xsocial;

            // Agregar timestamp solo si hay campos para actualizar
            if (Object.keys(updateData).length > 0) {
                updateData.updated_at = new Date().toISOString();

                await updateDoc(userRef, updateData);

                if (userData.nombre) {
                    await updateProfile(auth.currentUser, {
                        displayName: userData.nombre
                    });
                }

                logInfo('Perfil de usuario actualizado exitosamente');
                return { success: true, message: 'Perfil actualizado correctamente' };
            }

            return { success: true, message: 'No hay cambios para actualizar' };
        } catch (error) {
            logError(`Error al actualizar perfil: ${error.message}`);
            return { success: false, error: 'Error al actualizar el perfil' };
        }
    },

    async updateProfilePhoto(file) {
        try {
            if (!file) throw new Error('No se proporcionó ningún archivo');

            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                throw new Error('Formato de imagen no válido. Use JPG, PNG o GIF');
            }

            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                throw new Error('La imagen no debe superar los 5MB');
            }

            if (auth.currentUser.photoURL) {
                const oldPhotoRef = ref(storage, `profile_photos/${auth.currentUser.uid}`);
                try {
                    await deleteObject(oldPhotoRef);
                    logInfo('Foto anterior eliminada correctamente');
                } catch (error) {
                    logDebug('No se encontró foto anterior para eliminar');
                }
            }

            const photoRef = ref(storage, `profile_photos/${auth.currentUser.uid}`);
            const metadata = {
                contentType: file.type,
                customMetadata: {
                    'uploadedBy': auth.currentUser.uid,
                    'uploadedAt': new Date().toISOString()
                }
            };

            await uploadBytes(photoRef, file, metadata);
            const photoURL = await getDownloadURL(photoRef);

            await updateProfile(auth.currentUser, { photoURL });
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, {
                photoURL,
                updated_at: new Date().toISOString()
            });

            logInfo('Foto de perfil actualizada exitosamente');
            return { success: true, photoURL };
        } catch (error) {
            logError(`Error al actualizar foto de perfil: ${error.message}`);
            return { success: false, error: 'Error al actualizar la foto de perfil' };
        }
    },

    async sendPasswordResetEmail(email) {
        try {
            await sendPasswordResetEmail(auth, email);
            logInfo(`Correo de restablecimiento enviado a: ${email}`);
            return {
                success: true,
                message: 'Se ha enviado un correo para restablecer la contraseña'
            };
        } catch (error) {
            logError(`Error al enviar correo de restablecimiento: ${error.message}`);
            return {
                success: false,
                error: 'Error al enviar el correo de restablecimiento'
            };
        }
    },

    getReferrerName(userId = null) {
        return new Promise((resolve, reject) => {
            try {
                const userIdToUse = userId || auth.currentUser?.uid;

                if (!userIdToUse) {
                    logError('No se proporcionó ID de usuario ni hay usuario autenticado');
                    resolve('DinnerMax');
                    return;
                }

                const unsubscribe = referralService.getReferralStats(
                    userIdToUse,
                    (referralInfo) => {
                        unsubscribe();
                        resolve(referralInfo.referrer?.nombre || 'DinnerMax');
                    }
                );
            } catch (error) {
                logError('Error al obtener nombre del referidor:', error);
                resolve('DinnerMax');
            }
        });
    }
};