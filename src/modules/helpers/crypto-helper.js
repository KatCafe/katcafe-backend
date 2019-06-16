const crypto = require('crypto');

const secret = 'KABOOOM';

class CryptoHelper {

    sha256(data){


        const hash = crypto.createHmac('sha256', secret)
            .update(data)
            .digest();

        return hash;

    }


}

export default new CryptoHelper();