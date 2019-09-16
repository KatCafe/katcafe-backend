import client from "modules/DB/redis"
import TopicModel from "./topic.model"
import StringHelper from "modules/helpers/string-helper";
import Model from "../../model";

export default class Topic extends TopicModel {

    constructor( slug, channel, uuid, title='', link='', preview, body='', author='', country='', date){
        super( slug, channel , uuid, StringHelper.removeWhiteSpace( title ), StringHelper.removeWhiteSpace( link ), preview, StringHelper.removeWhiteSpace( body ), StringHelper.removeWhiteSpace( author ), country.toLowerCase(), date);
    }


    async saveScore(){

        await client.saddAsync(this._table+"s:list", this.id );
        const hot = - this.hot();
        const date = - this.date;

        const promises = ["channel", "country"].map( it => Promise.all([

                client.saddAsync(this._table+'s:list:'+it+':' + this[it].toLowerCase(), this.id ),
                client.zaddAsync(this._table+'s:rank:hot:'+it+':' + this[it].toLowerCase(), hot, this.id ),
                client.zaddAsync(this._table+'s:rank:date:'+it+':' + this[it].toLowerCase(), date, this.id )

            ])
        );

        await Promise.all(promises);

    }


    async deleteScore(){

        client.sremAsync(this._table+"s:list", this.id );

        const promises = ["channel", "country"].map( it => Promise.all([

                client.sremAsync(this._table+'s:list:'+it+':' + this[it].toLowerCase(), this.id ),
                client.zremAsync(this._table+'s:rank:hot:'+it+':' + this[it].toLowerCase(), this.id ),
                client.zremAsync(this._table+'s:rank:date:'+it+':' + this[it].toLowerCase(), this.id )

            ])
        );

        await Promise.all(promises);

    }

    async load(){

        const promises = [
            super.load.call(this),
            client.zcardAsync('comments:rank:date:topic:'+this.id.toLowerCase() )
        ];
        const out = await Promise.all(promises);

        this.comments = out[1] || 0;

    }

    _score(){
        return ( this.votesUp || 0 ) - ( this.votesDown || 0 ) + Math.log10( Math.max( this.comments || 0, 1) );
    }

}