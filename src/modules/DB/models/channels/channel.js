import client from "modules/DB/redis"
import ChannelModel from "./channel.model"
import StringHelper from "modules/helpers/string-helper";

export default class Channel extends ChannelModel {

    constructor( slug, name = '', title = '', icon, cover, owner, country = '', date){
        super(slug, name, title, icon, cover, owner, country, date);
    }

    async saveScore(){

        await client.saddAsync(this._table+"s:list", this.id );


        const hot = - this.hot();
        const date = - this.date;

        const promises = ["country"].map( it => Promise.all([

                client.zaddAsync(this._table+'s:rank:hot:'+it+':' + this[it].toLowerCase(), hot, this.id ),
                client.zaddAsync(this._table+'s:rank:date:'+it+':' + this[it].toLowerCase(), date, this.id )

            ])
        );

        await Promise.all(promises);

    }


    async deleteScore(){

        client.sremAsync(this._table+"s:list", this.id );

        const promises = ["country"].map( it => Promise.all([

                client.zremAsync(this._table+'s:rank:hot:'+it+':' + this[it].toLowerCase(), this.id ),
                client.zremAsync(this._table+'s:rank:date:'+it+':' + this[it].toLowerCase(), this.id )

            ])
        );

        await Promise.all( promises );

    }

    _score(){
        return this.topics || 0;
    }

    hot(){
        return Math.log10( this._score() || 1 );
    }

}