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
        const date = - this.date;

        const promises = ["channel", "topic", "country"].map( it => Promise.all([

                client.zaddAsync(this._table+'s:rank:hot:'+it+':' + this[it].toLowerCase(), hot, this.id ),
                client.zaddAsync(this._table+'s:rank:date:'+it+':' + this[it].toLowerCase(), date, this.id )

            ])
        );

        await Promise.all(promises);

    }


    async deleteScore(){

        client.sremAsync(this._table+"s:list", this.id );

        const promises = ["channel", "topic", "country"].map( it => Promise.all([

                client.zremAsync(this._table+'s:rank:hot:'+it+':' + this[it].toLowerCase(), this.id ),
                client.zremAsync(this._table+'s:rank:date:'+it+':' + this[it].toLowerCase(), this.id )

            ])
        );

        await Promise.all(promises);

    }




}