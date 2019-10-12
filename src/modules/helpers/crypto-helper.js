let crypto;
try {
    crypto = require('crypto');
} catch (err) {
    console.log('crypto support is disabled!');
}

import constsSecret from "consts/consts-secret"

class CryptoHelper {

    md5(data){
        return crypto.createHash('md5').update(data).digest();
    }

    dsha256(data, secret = constsSecret.crypto.SECRET){
        return this.sha256( this.sha256(data, secret), secret);
    }

    sha256(data, secret = constsSecret.crypto.SECRET){

        const sha256 = secret ? crypto.createHmac('sha256', secret  ) : crypto.createHash('sha256');

        return sha256.update(data).digest();

    }

    encryptText(text){
        return this.encrypt(Buffer.from(text));
    }

    encrypt(text) {

        let cipher = crypto.createCipheriv('aes-256-cbc', constsSecret.crypto.KEY, constsSecret.crypto.IV );
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return encrypted;
    }

    decryptText(text){
        return this.decrypt(text).toString();
    }

    decrypt(input) {
        let encryptedText = Buffer.from( input, 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', constsSecret.crypto.KEY, constsSecret.crypto.IV );
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted;
    }


}

export default new CryptoHelper();