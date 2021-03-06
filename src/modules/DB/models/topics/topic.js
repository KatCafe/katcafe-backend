import client from "modules/DB/redis"
import TopicModel from "./topic.model"
import Comment from "./../comments/comment"

import StringHelper from "modules/helpers/string-helper";
import Model from "../../model";
import FileController from "../files/file-controller";

export default class Topic extends TopicModel {

    constructor( slug, channel, uuid, title='', link='', preview, body='', isAnonymous=false, owner, country='', ip='', date = new Date().getTime() ){
        super( slug, channel , uuid, title, link, preview, body , isAnonymous, owner, country.toLowerCase(), ip.toLowerCase(), date);
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

        if (!out[0]) return false;

        this.comments = out[1] || 0;

        return this;
    }

    _score(){
        return ( this.votesUp || 0 ) - ( this.votesDown || 0 ) + Math.log10( Math.max( this.comments || 0, 1) );
    }

    async delete(){

        //delete comments first
        const comments = [];

        let index = 0;
        do {
            const out = await client.sscanAsync( 'comments:list:topic:'+this.slug.toLowerCase(), index );
            index = Number.parseInt(out[0]);

            out[1].map( it => comments.push(it ));
        } while (index !== 0);

        const commentsModels = await Promise.all( comments.map ( async it  => {

            const comment = new Comment( it );
            await comment.load();

            return comment;
        }));

        await Promise.all( commentsModels.map( it => it.delete() ) );

        if ( this.preview && this.preview.sha256)
            await FileController.deleteFile(this.preview.sha256);

        return super.delete();
    }

}