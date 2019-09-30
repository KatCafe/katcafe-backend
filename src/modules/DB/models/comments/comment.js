import client from "modules/DB/redis"
import CommentModel from "./comment.model"
import StringHelper from "modules/helpers/string-helper";
import FileController from "modules/DB/models/files/file-controller"

export default class Comment extends CommentModel {

    constructor( slug, topic, channel, uuid, body ='', link = '', preview, isAnonymous = false, owner, country = '', date = new Date().getTime() ){
        super(slug, topic, channel, uuid, body, link, preview, isAnonymous, owner, country.toLowerCase(), date);
    }

    async saveScore(){

        await client.saddAsync(this._table+"s:list", this.id );

        const hot = - this.hot();
        const date = - this.date;

        const promises = [ "channel", "topic", "country" ].map( it => Promise.all([

                client.saddAsync(this._table+'s:list:'+it+':' + this[it].toLowerCase(), this.id ),
                client.zaddAsync(this._table+'s:rank:hot:'+it+':' + this[it].toLowerCase(), hot, this.id ),
                client.zaddAsync(this._table+'s:rank:date:'+it+':' + this[it].toLowerCase(), date, this.id )

            ])
        );

        await Promise.all(promises);

    }


    async deleteScore(){

        client.sremAsync(this._table+"s:list", this.id );

        const promises = ["channel", "topic", "country"].map( it => Promise.all([

                client.sremAsync(this._table+'s:list:'+it+':' + this[it].toLowerCase(), this.id ),
                client.zremAsync(this._table+'s:rank:hot:'+it+':' + this[it].toLowerCase(), this.id ),
                client.zremAsync(this._table+'s:rank:date:'+it+':' + this[it].toLowerCase(), this.id )

            ])
        );

        await Promise.all(promises);

    }

    // hot(){
    //     return this.confidence(this.votesUp , this.votesDown)
    // }

    _score(){
        return ( this.votesUp || 0 ) - ( this.votesDown || 0 );
    }

    async delete(){

        if ( this.preview && this.preview.sha256)
            await FileController.deleteFile(this.preview.sha256);

        return super.delete();
    }

}