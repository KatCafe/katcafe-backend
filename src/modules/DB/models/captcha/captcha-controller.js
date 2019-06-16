import CryptoHelper from "src/modules/helpers/crypto-helper"
import client from "modules/DB/redis"

class CaptchaController {

    async captchaSolution(solution, encryption){

        try{

            const data = CryptoHelper.decryptText(encryption);

            const array = data.split('#$#');

            const version = array[0];
            const sol = array[0];
            const id = array[1];
            const date = array[2];

            if (sol !== solution)
                throw "Captcha is incorrect";

            const out = await client.hexistsAsync("captcha", "used", id );
            if (out === 1)
                throw "Captcha was already used";

            await client.hsetAsync("captcha", 'used', id);

            return true;

        }catch(err){

        }

    }

}

export default new CaptchaController();