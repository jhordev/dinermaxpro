import { db, storage } from '@/services/firebase_config';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { logInfo, logError } from '@/utils/logger.js';

export const walletService = {
    // Referencia al documento único de wallets
    walletsDoc: doc(db, 'system', 'wallets'),

    // Escuchar cambios en tiempo real
    subscribeToWallets(callback) {
        return onSnapshot(this.walletsDoc,
            (doc) => {
                const wallets = doc.exists() ? Object.entries(doc.data()).map(([id, wallet]) => ({
                    id,
                    ...wallet
                })) : [];
                callback(wallets);
            },
            (error) => {
                logError('Error al escuchar cambios en wallets:', error);
            }
        );
    },

    async uploadQrImage(file) {
        try {
            const storageRef = ref(storage, `system/wallets/qr_images/${Date.now()}_${file.name}`);
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

            const docSnap = await getDoc(this.walletsDoc);
            const currentWallets = docSnap.exists() ? docSnap.data() : {};

            const walletId = Date.now().toString();
            const newWallet = {
                paymentMethod: walletData.get('paymentMethod'),
                network: walletData.get('network'),
                walletAddress: walletData.get('walletAddress'),
                qrImage: qrImageUrl,
                createdAt: new Date()
            };

            await setDoc(this.walletsDoc, {
                ...currentWallets,
                [walletId]: newWallet
            });

            logInfo('Wallet creada exitosamente');
            return { id: walletId, ...newWallet };
        } catch (error) {
            logError('Error al crear wallet:', error);
            throw error;
        }
    },

    async updateWallet(id, walletData) {
        try {
            const docSnap = await getDoc(this.walletsDoc);
            const currentWallets = docSnap.exists() ? docSnap.data() : {};

            if (!currentWallets[id]) {
                throw new Error('Wallet no encontrada');
            }

            let updateData = {
                paymentMethod: walletData.get('paymentMethod'),
                network: walletData.get('network'),
                walletAddress: walletData.get('walletAddress'),
                updatedAt: new Date()
            };

            if (walletData.get('voucherImage')) {
                const qrImageUrl = await this.uploadQrImage(walletData.get('voucherImage'));
                updateData.qrImage = qrImageUrl;
            } else {
                updateData.qrImage = currentWallets[id].qrImage;
            }

            await setDoc(this.walletsDoc, {
                ...currentWallets,
                [id]: {
                    ...currentWallets[id],
                    ...updateData
                }
            });

            logInfo('Wallet actualizada exitosamente');
            return { id, ...updateData };
        } catch (error) {
            logError('Error al actualizar wallet:', error);
            throw error;
        }
    },

    async deleteWallet(id) {
        try {
            const docSnap = await getDoc(this.walletsDoc);
            const currentWallets = docSnap.exists() ? docSnap.data() : {};

            if (!currentWallets[id]) {
                throw new Error('Wallet no encontrada');
            }

            const { [id]: deletedWallet, ...remainingWallets } = currentWallets;
            await setDoc(this.walletsDoc, remainingWallets);

            logInfo('Wallet eliminada exitosamente');
            return true;
        } catch (error) {
            logError('Error al eliminar wallet:', error);
            throw error;
        }
    }
};