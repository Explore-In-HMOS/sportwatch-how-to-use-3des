import huks from '@ohos.security.huks';

let handle = null;

export default class CryptoHelper {
    encryptText(key, data) {
        try {
            const result = this.encrypt3DES(key, data);
            return result;
        } catch (error) {
            console.error(`3DES encryption error: ${error}`);
            throw error;
        }
    }


    encrypt3DES(data, key) {
        let huksInfo;
        let ret = true;

        const initOptions = {
            // true for encryption
            properties: this.get3DESProperties(true),
            inData: new Uint8Array()
        };

        const finishOptions = {
            properties: this.get3DESProperties(true),
            inData: data
        };

        huks.importKeyItem('3des_key', {
            properties: this.getImport3DESKeyProperties(),
            inData: key
        }, function (err, importData) {
            if (err) {
                console.error(`import 3DES key error: ${err}`);
                ret = false;
                return;
            }

            huks.initSession('3des_key', initOptions, function (initErr, initData) {
                if (initErr) {
                    console.error(`3DES init error code: ${initErr.code} message :${initErr.message}`);
                    ret = false;
                    huks.abortSession(initData.handle, initOptions, function (abortErr, abortData) {
                        if (abortErr) {
                            console.error(`3DES init abortSession error code: ${abortErr.code} message :${abortErr.message}`);
                        }
                        console.info('3DES init abortSession success');
                    });
                }

                handle = initData.handle;
            });

            if (ret === false) {
                console.error('3DES initSession failed');
            }

            huks.finishSession(handle, finishOptions, function (finishErr, finishData) {
                if (finishErr) {
                    ret = false;
                    console.error(`3DES finishSession error code: ${finishErr.code} message :${finishErr.message}`);
                    huks.abortSession(handle, finishOptions, function (abortErr, abortData) {
                        if (abortErr) {
                            console.error(`3DES finish abortSession error code: ${abortErr.code} message :${abortErr.message}`);
                        }
                        console.info('3DES finish abortSession success');
                    });
                }
                huksInfo = finishData.outData;
            });

            if (ret === false) {
                console.error('3DES finishSession failed');
            }
        });

        handle = null;
        return huksInfo;
    }


    getImport3DESKeyProperties() {
        const properties = [];
        let index = 0;

        properties[index++] = {
            tag: huks.HuksTag.HUKS_TAG_ALGORITHM,
            value: huks.HuksKeyAlg.HUKS_ALG_3DES
        };
        properties[index++] = {
            tag: huks.HuksTag.HUKS_TAG_KEY_SIZE,
            value: huks.HuksKeySize.HUKS_3DES_KEY_SIZE_192
        };
        properties[index++] = {
            tag: huks.HuksTag.HUKS_TAG_PURPOSE,
            value: huks.HuksKeyPurpose.HUKS_KEY_PURPOSE_ENCRYPT | huks.HuksKeyPurpose.HUKS_KEY_PURPOSE_DECRYPT
        };

        return properties;
    }

    get3DESProperties(encryptMode) {
        const properties = [];
        let index = 0;

        properties[index++] = {
            tag: huks.HuksTag.HUKS_TAG_ALGORITHM,
            value: huks.HuksKeyAlg.HUKS_ALG_3DES
        };
        properties[index++] = {
            tag: huks.HuksTag.HUKS_TAG_KEY_SIZE,
            value: huks.HuksKeySize.HUKS_3DES_KEY_SIZE_192
        };
        properties[index++] = {
            tag: huks.HuksTag.HUKS_TAG_PURPOSE,
            value: encryptMode ?
            huks.HuksKeyPurpose.HUKS_KEY_PURPOSE_ENCRYPT :
            huks.HuksKeyPurpose.HUKS_KEY_PURPOSE_DECRYPT
        };
        properties[index++] = {
            tag: huks.HuksTag.HUKS_TAG_PADDING,
            value: huks.HuksKeyPadding.HUKS_PADDING_NONE
        };
        properties[index++] = {
            tag: huks.HuksTag.HUKS_TAG_BLOCK_MODE,
            value: huks.HuksCipherMode.HUKS_MODE_ECB
        };

        return properties;
    }

    hexStringToUint8Array(hexString) {
        let str = hexString;
        if (str.length % 2 !== 0) {
            str = '0' + str;
        }
        const byteArray = new Uint8Array(str.length / 2);
        for (let i = 0; i < str.length; i += 2) {

            const firstChar = str.charAt(i);
            const secondChar = str.charAt(i + 1);
            const byteValue = parseInt(firstChar + secondChar, 16);
            byteArray[i / 2] = byteValue;
        }
        return byteArray;
    }


    byteArrayToHexString(byteArray) {
        let hex = '';
        for (let i = 0; i < byteArray.length; i++) {
            const byte = byteArray[i].toString(16);
            hex += byte.length === 1 ? '0' + byte : byte;
        }
        return hex;
    }
}