const { onCall } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

admin.initializeApp();

exports.createSocioUser = onCall(async (request) => {
    try {
        if (!request.auth) {
            throw new Error('Usuario no autenticado');
        }

        const data = request.data;
        logger.info("Iniciando creación de usuario socio", { email: data.email });

        const callerUid = request.auth.uid;
        const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();

        if (!callerDoc.exists || !['admin', 'superadmin'].includes(callerDoc.data().role)) {
            throw new Error('No tienes permisos para crear usuarios socios');
        }

        const userRecord = await admin.auth().createUser({
            email: data.email,
            password: data.password,
            displayName: data.nombre
        });

        await admin.auth().setCustomUserClaims(userRecord.uid, {
            role: 'socio'
        });

        const userData = {
            email: data.email,
            nombre: data.nombre,
            pais: data.pais,
            registro: data.registro || new Date().toISOString(),
            estado: data.estado,
            role: 'socio',
            password: data.password,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await admin.firestore().collection('users').doc(userRecord.uid).set(userData);

        return {
            success: true,
            userData: {
                ...userData,
                docId: userRecord.uid
            }
        };
    } catch (error) {
        logger.error("Error al crear usuario socio", { error: error.message });
        throw new Error(error.message);
    }
});

exports.updateSocioUser = onCall(async (request) => {
    try {
        if (!request.auth) {
            throw new Error('Usuario no autenticado');
        }

        const data = request.data;
        logger.info("Iniciando actualización de usuario socio", { email: data.email });

        const callerUid = request.auth.uid;
        const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();

        if (!callerDoc.exists || !['admin', 'superadmin'].includes(callerDoc.data().role)) {
            throw new Error('No tienes permisos para actualizar usuarios socios');
        }

        // Obtener el documento actual para preservar los campos existentes
        const currentDoc = await admin.firestore().collection('users').doc(data.docId).get();
        if (!currentDoc.exists) {
            throw new Error('Usuario no encontrado');
        }

        // Preparar datos para actualización en Firestore
        const updates = {
            email: data.email,
            nombre: data.nombre,
            pais: data.pais,
            password: data.password, // Mantener la contraseña en Firestore
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        // Actualizar en Authentication
        const authUpdates = {
            email: data.email,
            displayName: data.nombre,
            password: data.password
        };

        // Actualizar en Authentication
        await admin.auth().updateUser(data.docId, authUpdates);

        // Actualizar en Firestore
        await admin.firestore().collection('users').doc(data.docId).update(updates);

        // Obtener el documento actualizado
        const updatedDoc = await admin.firestore().collection('users').doc(data.docId).get();

        return {
            success: true,
            userData: {
                ...updatedDoc.data(),
                docId: data.docId
            }
        };
    } catch (error) {
        logger.error("Error al actualizar usuario socio", { error: error.message });
        throw new Error(error.message);
    }
});