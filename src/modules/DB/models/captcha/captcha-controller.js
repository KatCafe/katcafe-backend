import CryptoHelper from "src/modules/helpers/crypto-helper"
import client from "modules/DB/redis"
import StringHelper from "../../../helpers/string-helper";

class CaptchaController {

    async captchaSolution(solution, encryption){

        solution = StringHelper.sanitizeText(solution);

        const data = CryptoHelper.decryptText(encryption);

        const array = data.split('#$#');

        const version = array[0];
        const sol = array[1];
        const id = array[2];
        const date = array[3];

        const out = await client.hsetnxAsync("captcha",  id, date );
        if (out === 0)
            throw "Captcha was already used";

        if (sol.toLowerCase() !== solution.toLowerCase())
            throw "Captcha is incorrect";

        return true;

    }

}

export default new CaptchaController();