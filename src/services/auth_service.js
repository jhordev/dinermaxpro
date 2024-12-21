import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from './firebase_config';
import { logInfo, logError, logDebug } from '@/utils/logger.js';
import { emailService } from './email_service';

export const authService = {
    async registerUser(email, password, nombre) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            await updateProfile(userCredential.user, {
                displayName: nombre
            });

            await setDoc(doc(db, 'users', userCredential.user.uid), {
                nombre,
                email,
                createdAt: new Date(),
                role: 'user'
            });

            await this.sendVerificationCode(email);

            logInfo(`Usuario registrado exitosamente: ${email}`);

            return {
                success: true,
                user: userCredential.user
            };
        } catch (error) {
            let errorMessage = '';

            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'El correo electrónico ya está registrado';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'El correo electrónico no es válido';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'La operación no está permitida';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'La contraseña debe tener al menos 6 caracteres';
                    break;
                default:
                    errorMessage = 'Error al registrar el usuario';
            }

            logError(`Error en registro: ${error.message}`);
            return {
                success: false,
                error: errorMessage
            };
        }
    },

    async loginUser(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            logInfo(`Inicio de sesión exitoso: ${email}`);

            return {
                success: true,
                user: userCredential.user
            };
        } catch (error) {
            let errorMessage = '';

            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'Usuario no encontrado';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Contraseña incorrecta';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Correo electrónico inválido';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'Usuario deshabilitado';
                    break;
                default:
                    errorMessage = 'Error al iniciar sesión';
            }

            logError(`Error en inicio de sesión: ${error.message}`);
            return {
                success: false,
                error: errorMessage
            };
        }
    },

    async sendVerificationCode(email) {
        try {
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

            await setDoc(doc(db, 'verification_codes', email), {
                code: verificationCode,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 5 * 60000)
            });

            const emailResult = await emailService.sendEmail(
                email,
                'Código de Verificación',
                verificationCode
            );

            if (!emailResult.success) {
                throw new Error(emailResult.error);
            }

            logDebug(`Código de verificación enviado a ${email}: ${verificationCode}`);

            return {
                success: true,
                message: 'Código de verificación enviado'
            };
        } catch (error) {
            logError(`Error al enviar código de verificación: ${error.message}`);
            return {
                success: false,
                error: 'Error al enviar el código de verificación'
            };
        }
    },

    async checkValidationStatus(email) {
        try {
            const docRef = doc(db, 'users', auth.currentUser.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                throw new Error('Usuario no encontrado');
            }

            const userData = docSnap.data();

            return {
                success: true,
                isValidated: userData.isValidated || false
            };
        } catch (error) {
            logError(`Error al verificar estado de validación: ${error.message}`);
            return {
                success: false,
                error: 'Error al verificar el estado de validación'
            };
        }
    },

    async verifyCode(email, code) {
        try {
            const docRef = doc(db, 'verification_codes', email);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                throw new Error('No se encontró el código de verificación');
            }

            const data = docSnap.data();
            const now = new Date();

            if (now > data.expiresAt.toDate()) {
                throw new Error('El código ha expirado');
            }

            if (code !== data.code) {
                throw new Error('Código inválido');
            }

            // Actualizar el estado de validación del usuario
            await setDoc(doc(db, 'users', auth.currentUser.uid), {
                isValidated: true
            }, { merge: true });

            await deleteDoc(docRef);

            logInfo(`Código verificado exitosamente para: ${email}`);
            return {
                success: true,
                message: 'Código verificado correctamente'
            };
        } catch (error) {
            logError(`Error en verificación de código: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    },

    async logout() {
        try {
            await signOut(auth);
            logInfo('Sesión cerrada exitosamente');
            return {
                success: true,
                message: 'Sesión cerrada correctamente'
            };
        } catch (error) {
            logError(`Error al cerrar sesión: ${error.message}`);
            return {
                success: false,
                error: 'Error al cerrar sesión'
            };
        }
    },
};