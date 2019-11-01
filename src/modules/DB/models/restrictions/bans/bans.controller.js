import Controller from "../../../controller";

class BansController extends Controller {

    constructor(){

        super('bans', undefined);

        this._list = [];

    }

    async processBan( {auth, ipAddress} ){

        for (const ip of this._list){

            if (ipAddress === ip)
                throw "you have been banned";

        }

    }


}

export default new BansController ();