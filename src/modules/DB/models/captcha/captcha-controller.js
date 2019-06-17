import CryptoHelper from "src/modules/helpers/crypto-helper"
import client from "modules/DB/redis"

class CaptchaController {

    async captchaSolution(solution, encryption){

        const data = CryptoHelper.decryptText(encryption);

        const array = data.split('#$#');

        const version = array[0];
        const sol = array[1];
        const id = array[2];
        const date = array[3];

        const out = await client.hexistsAsync("captcha",  id );
        if (out === 1)
            throw "Captcha was already used";

        await client.hsetAsync("captcha", id, date);

        if (sol.toLowerCase() !== solution.toLowerCase())
            throw "Captcha is incorrect";

        return true;

    }

}

export default new CaptchaController();