import Controller from "../../../controller";
import CryptoHelper from "modules/helpers/crypto-helper"
import client from "modules/DB/redis"

class NotificationSubscribers extends  Controller{

    constructor(){
        super("subscribers", null);
    }

    async addSubscriber({id, who}, {publicKey, auth}){

        if (!who) who = CryptoHelper.md5(auth ? auth.user : publicKey ).toString("base64");

        await client.saddAsync(this._table + "s:"+id+":list", who);

    }

    async removeSubscriber({id, who}, {publicKey, auth}){

        if (!who) who = CryptoHelper.md5(auth ? auth.user : publicKey ).toString("base64");

        await client.sremAsync(this._table + "s:"+id+":list", who);
    }

}

export default new NotificationSubscribers();