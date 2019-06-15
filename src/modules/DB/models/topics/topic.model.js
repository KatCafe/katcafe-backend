import Model from "modules/DB/model"

export default class TopicModel extends Model {

    constructor( slug, channel, title, link, image, body, author, country, date){

        super( "topic", [ "slug", "channel", "title","link", "body", "author", "image", "country" , "date" ] );

        this.slug = slug;

        this.channel = channel;
        this.title = title;
        this.body = body;

        this.link = link;
        this.image = image;
        this.author = author;

        this.country = country;

        this.date = date;

    }

    get id(){
        return this.slug;
    }

}