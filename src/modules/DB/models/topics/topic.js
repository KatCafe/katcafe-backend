import client from "modules/DB/redis"
import TopicModel from "./topic.model"
import StringHelper from "modules/helpers/string-helper";

export default class Topic extends TopicModel {

    constructor( slug, channel, title='', link='', preview, body='', author='', country='', date){
        super( slug, channel , StringHelper.removeWhiteSpace( title ), StringHelper.removeWhiteSpace( link ), preview, StringHelper.removeWhiteSpace( body ), StringHelper.removeWhiteSpace( author ), country.toLowerCase(), date);
    }

    async saveScore(){

        await client.saddAsync(this._table+"s:list", this.id );

        const hot = - this.hot();
        const date = - this.date;

        const promises = ["channel", "country"].map( it => Promise.all([

                client.zaddAsync(this._table+'s:rank:hot:'+it+':' + this[it].toLowerCase(), hot, this.id ),
                client.zaddAsync(this._table+'s:rank:date:'+it+':' + this[it].toLowerCase(), date, this.id )

            ])
        );

        await Promise.all(promises);

    }


    async deleteScore(){

        client.sremAsync(this._table+"s:list", this.id );

        const promises = ["channel", "country"].map( it => Promise.all([

                client.zremAsync(this._table+'s:rank:hot:'+it+':' + this[it].toLowerCase(), this.id ),
                client.zremAsync(this._table+'s:rank:date:'+it+':' + this[it].toLowerCase(), this.id )

            ])
        );

        await Promise.all(promises);

    }



}