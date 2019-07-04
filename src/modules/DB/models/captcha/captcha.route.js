const svgCaptcha = require('svg-captcha');

import CryptoHelper from "src/modules/helpers/crypto-helper"
import StringHelper from "modules/helpers/string-helper";

export default function (express){

    express.get('/captcha/get', async function(req, res ) {

        try{

            const captcha = svgCaptcha.create({
                ignoreChars: '0o1ilI',
                noise: 3,
                color: true,
            });

            res.json( {

                result: true,

                captcha: {
                    data: captcha.data,
                    encryption: CryptoHelper.encryptText( 0 + "#$#"+captcha.text + "#$#" + StringHelper.makeId(32) + "#$#" + new Date().getTime() ).toString("hex") ,
                },

            });

        }catch(err){
            res.status(500).json( err.toString() );
        }


    });


}