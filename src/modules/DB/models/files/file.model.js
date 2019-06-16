import Model from "modules/DB/model"

export default class FileModel extends Model {

    constructor( slug, mime, preview, title, sha256, extra, date){

        super( "file", [ "slug", "mime", "preview", "title", "sha256", "extra", "date" ] );

        this.slug = slug;
        this.mime = mime;
        this.preview = preview;
        this.title = title;
        this.sha256 = sha256;
        this.extra = extra;

        this.date = date;

    }

    get id(){
        return this.slug;
    }

}