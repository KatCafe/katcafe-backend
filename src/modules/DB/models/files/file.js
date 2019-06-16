import client from "modules/DB/redis"
import FileModel from "./file.model"
import StringHelper from "../../../helpers/string-helper";


export default class File extends FileModel {

    constructor( slug, mime, preview, title = '', sha256 ='', extra, date){
        super(slug, mime, preview, StringHelper.removeWhiteSpace( title ), sha256.toLowerCase(), extra, date);
    }

    async saveScore(){

        await client.saddAsync(this._table+"s:list", this.id );
        await client.hsetAsync(this._table+"s:hash",  this.sha256, this.slug);

    }


    async deleteScore(){

        await client.sremAsync(this._table+"s:list", this.id );
        await client.hdelAsync(this._table+"s:hash", this.sha256 );

    }




}