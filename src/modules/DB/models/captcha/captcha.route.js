const svgCaptcha = require('svg-captcha');

import CryptoHelper from "src/modules/helpers/crypto-helper"
import StringHelper from "modules/helpers/string-helper";

const size = 4;

export default function (express){

    express.get('/captcha/get', async function(req, res ) {

        try{

            const captcha = svgCaptcha.create({
                ignoreChars: 'Oo1ilI',
                noise: 1,
                color: true,
                size: size,
            });

            res.json( {

                captcha: {
                    size,
                    data: captcha.data,
                    encryption: CryptoHelper.encryptText( 0 + "#$#"+captcha.text + "#$#" + StringHelper.makeId(32) + "#$#" + new Date().getTime() ).toString("hex") ,
                },

            });

        }catch(err){
            console.log(err);
            res.status(500).json( err.toString() );
        }


    });


}