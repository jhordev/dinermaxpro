import { db, storage } from '@/services/firebase_config';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { logInfo, logError } from '@/utils/logger.js';

export const walletService = {
    // Referencia a la colección
    walletsRef: collection(db, 'wallets'),

    // Escuchar cambios en tiempo real
    subscribeToWallets(callback) {
        return onSnapshot(this.walletsRef,
            (snapshot) => {
                const wallets = [];
                snapshot.forEach((doc) => {
                    wallets.push({ id: doc.id, ...doc.data() });
                });
                callback(wallets);
            },
            (error) => {
                logError('Error al escuchar cambios en wallets:', error);
            }
        );
    },

    async uploadQrImage(file) {
        try {
            const storageRef = ref(storage, `qr_images/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            logInfo('QR imagen subida exitosamente');
            return downloadURL;
        } catch (error) {
            logError('Error al subir QR imagen:', error);
            throw error;
        }
    },

    async createWallet(walletData) {
        try {
            let qrImageUrl = null;
            if (walletData.get('voucherImage')) {
                qrImageUrl = await this.uploadQrImage(walletData.get('voucherImage'));
            }

            const walletDoc = {
                paymentMethod: walletData.get('paymentMethod'),
                network: walletData.get('network'),
                walletAddress: walletData.get('walletAddress'),
                qrImage: qrImageUrl,
                createdAt: new Date()
            };

            const docRef = await addDoc(this.walletsRef, walletDoc);
            logInfo('Wallet creada exitosamente');
            return { id: docRef.id, ...walletDoc };
        } catch (error) {
            logError('Error al crear wallet:', error);
            throw error;
        }
    },

    async updateWallet(id, walletData) {
        try {
            const docRef = doc(db, 'wallets', id);
            let updateData = {
                paymentMethod: walletData.get('paymentMethod'),
                network: walletData.get('network'),
                walletAddress: walletData.get('walletAddress'),
                updatedAt: new Date()
            };

            if (walletData.get('voucherImage')) {
                const qrImageUrl = await this.uploadQrImage(walletData.get('voucherImage'));
                updateData.qrImage = qrImageUrl;
            }

            await updateDoc(docRef, updateData);
            logInfo('Wallet actualizada exitosamente');
            return { id, ...updateData };
        } catch (error) {
            logError('Error al actualizar wallet:', error);
            throw error;
        }
    },

    async deleteWallet(id) {
        try {
            const docRef = doc(db, 'wallets', id);
            await deleteDoc(docRef);
            logInfo('Wallet eliminada exitosamente');
            return true;
        } catch (error) {
            logError('Error al eliminar wallet:', error);
            throw error;
        }
    }
};