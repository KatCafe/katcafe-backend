import Model from "modules/DB/model"

export default class CommentModel extends Model {

    constructor( slug, topic, body, link, preview, channel, country, date){

        super( "comment", ["slug", "topic", "body","link", "preview", "channel", "country", "date"] );

        this.slug = slug;

        this.topic = topic;
        this.body = body;
        this.link = link;
        this.preview = preview;

        this.channel = channel;
        this.country = country;

        this.date = date;

    }

    get id(){
        return this.slug;
    }

}