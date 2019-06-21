import Model from "modules/DB/model"

export default class TopicModel extends Model {

    constructor( slug, channel, uuid, title, link, preview, body, author, country, date){

        super( "topic", [ "slug", "channel", "uuid", "title","link", "body", "author", "preview", "country" , "date" ], ["comments", "votesUp", "votesDown"] );

        this.channel = channel;

        this.uuid = uuid;
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
        return this.slug.toLowerCase();
    }

}