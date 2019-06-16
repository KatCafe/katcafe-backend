import Model from "modules/DB/model"

export default class TopicModel extends Model {

    constructor( slug, channel, title, link, preview, body, author, country, date){

        super( "topic", [ "slug", "channel", "title","link", "body", "author", "preview", "country" , "date" ] );

        this.channel = channel;
        this.title = title;
        this.body = body;

        this.link = link;
        this.preview = preview;
        this.author = author;

        this.slug = slug;

        this.country = country;

        this.date = date;

    }

    get id(){
        return this.slug;
    }

}