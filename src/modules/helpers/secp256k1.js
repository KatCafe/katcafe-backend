const { randomBytes } = require('crypto')
const secp256k1 = require('secp256k1');

import CryptoHelper from "./crypto-helper"

class SECP256K1{

    createPrivateKey(){

        let privKey;
        do {
            privKey = randomBytes(32)
        } while (!secp256k1.privateKeyVerify(privKey));

        return privKey;

    }

    createPublicKey(privateKey){

        return secp256k1.publicKeyCreate(privateKey)

    }

    sign(message, privateKey){

        if (message.length !== 32) message = CryptoHelper.sha256(message, null);
        if (typeof privateKey === "string") privateKey = Buffer.from(privateKey, "hex");

        const sigObj = secp256k1.sign(message, privateKey );
        return Buffer.from( sigObj.signature );
    }

    verify(message, signature, publicKey ){

        if (message.length !== 32) message= CryptoHelper.sha256(message, null);
        if (typeof publicKey === "string") publicKey = Buffer.from(publicKey, "hex");
        if (typeof signature === "string") signature = Buffer.from(signature, "hex")

        return secp256k1.verify(message, signature, publicKey );

    }

}

export default new SECP256K1();