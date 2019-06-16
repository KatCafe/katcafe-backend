import client from "modules/DB/redis"
import CommentModel from "./comment.model"
import StringHelper from "../../../helpers/string-helper";


export default class Comment extends CommentModel {

    constructor( slug, topic, channel, body ='', link = '', preview, author = '', country = '', date){
        super(slug, topic, channel, StringHelper.removeWhiteSpace( body ), StringHelper.removeWhiteSpace( link ), preview, StringHelper.removeWhiteSpace( author ), country.toLowerCase(), date);
    }

    async saveScore(){

        await client.saddAsync(this._table+"s:list", this.id );

        const hot = - this.hot();
        await client.zaddAsync(this._table+'s:rank:hot:channel:' + this.channel, hot, this.id );
        await client.zaddAsync(this._table+'s:rank:hot:country:' + this.country, hot, this.id );
        await client.zaddAsync(this._table+'s:rank:hot:topic:' + this.topic, hot, this.id );

        const date = - this.date;
        await client.zaddAsync(this._table+'s:rank:date:channel:' + this.channel, date, this.id );
        await client.zaddAsync(this._table+'s:rank:date:country:' + this.country, date, this.id );
        await client.zaddAsync(this._table+'s:rank:date:topic:' + this.topic, date, this.id );

    }


    async deleteScore(){

        client.sremAsync(this._table+"s:list", this.id );

        await client.zremAsync(this._table+'s:rank:hot:country:' + this.country, this.id );
        await client.zremAsync(this._table+'s:rank:hot:channel:' + this.channel, this.id );
        await client.zremAsync(this._table+'s:rank:hot:topic:' + this.topic, this.id );

        await client.zremAsync(this._table+'s:rank:date:country:' + this.country, this.id );
        await client.zremAsync(this._table+'s:rank:date:channel:' + this.channel, this.id );
        await client.zremAsync(this._table+'s:rank:date:topic:' + this.topic, this.id );

    }




}