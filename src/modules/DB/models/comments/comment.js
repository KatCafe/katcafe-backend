import client from "modules/DB/redis"
import CommentModel from "./comment.model"


export default class Comment extends CommentModel {

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