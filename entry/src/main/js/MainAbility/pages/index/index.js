import CryptoHelper from '../../CryptoHelper';

const cryptoHelper = new CryptoHelper();

export default {
    data: {
        encryptedHexStringData: '',
        encryptedUint8Array: ''
    },
    onInit() {
        const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
        const key = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4]);

        const encrypted = cryptoHelper.encryptText(data, key);
        // Expected Result : 41,117,137,40,229, 128,228,248
        // Expected Result : 29758928e580e4f8

        console.info(`Encrypted Uint8Array: ${encrypted}`);
        console.info(`Encrypted HexString: ${cryptoHelper.byteArrayToHexString(encrypted)}`);
        this.encryptedHexStringData = cryptoHelper.byteArrayToHexString(encrypted);
    },

};

