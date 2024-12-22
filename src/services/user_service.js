// services/user_service.js
import { auth, db, storage } from './firebase_config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { logInfo, logError, logDebug } from '@/utils/logger.js';
import {referralService} from "@/services/referral_service.js";

export const userService = {
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

    async updateUserProfile(userData) {
        try {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            const updateData = {
                nombre: userData.nombre,
                wallet: userData.wallet,
                sexo: userData.sexo,
                telefono: userData.telefono,
                pais: userData.pais,
                updated_at: new Date().toISOString()
            };

            await updateDoc(userRef, updateData);
            await updateProfile(auth.currentUser, {
                displayName: userData.nombre
            });

            logInfo('Perfil de usuario actualizado exitosamente');
            return { success: true, message: 'Perfil actualizado correctamente' };
        } catch (error) {
            logError(`Error al actualizar perfil: ${error.message}`);
            return { success: false, error: 'Error al actualizar el perfil' };
        }
    },

    async updateProfilePhoto(file) {
        try {
            if (!file) throw new Error('No se proporcionó ningún archivo');

            // Validaciones de archivo
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                throw new Error('Formato de imagen no válido. Use JPG, PNG o GIF');
            }

            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                throw new Error('La imagen no debe superar los 5MB');
            }

            // Eliminar foto anterior
            if (auth.currentUser.photoURL) {
                const oldPhotoRef = ref(storage, `profile_photos/${auth.currentUser.uid}`);
                try {
                    await deleteObject(oldPhotoRef);
                    logInfo('Foto anterior eliminada correctamente');
                } catch (error) {
                    logDebug('No se encontró foto anterior para eliminar');
                }
            }

            // Subir nueva foto
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

            // Actualizar perfil y Firestore
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

    async getReferrerName() {
        try {
            const referrerInfo = await referralService.getReferrerInfo(auth.currentUser.uid);
            return referrerInfo.nombre;
        } catch (error) {
            logError('Error al obtener nombre del referidor:', error);
            return 'DinnerMax';
        }
    }
};