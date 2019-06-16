import client from "modules/DB/redis"
import ChannelModel from "./channel.model"
import StringHelper from "../../../helpers/string-helper";


export default class Channel extends ChannelModel {

    constructor( slug, name = '', title = '', icon, cover, country = '', date){
        super(slug, StringHelper.removeWhiteSpace( name ), StringHelper.removeWhiteSpace( title), icon, cover, country.toLowerCase(), date);
    }

    async saveScore(){

        await client.saddAsync(this._table+"s:list", this.id );

        const hot = - this.hot();
        await client.zaddAsync(this._table+'s:rank:hot:' + this.country, hot, this.id );

        const date = - this.date;
        await client.zaddAsync(this._table+'s:rank:date:' + this.country, date, this.id );

    }


    async deleteScore(){

        client.sremAsync(this._table+"s:list", this.id );

        await client.zremAsync(this._table+'s:rank:hot:' + this.country, this.id );
        await client.zremAsync(this._table+'s:rank:date:' + this.country, this.id );

    }




}