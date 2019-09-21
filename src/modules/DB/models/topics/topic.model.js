import Model from "modules/DB/model"

export default class TopicModel extends Model {

    constructor( slug, channel, uuid, title, link, preview, body, author, owner, country, date ){

        super( "topic", [ "slug", "channel", "uuid", "title","link", "body", "author", "preview", 'owner', "country" , "date",
                          {name: "votesUp", default: 0}, {name: "votesDown", default: 0}],
               ["comments", {name: "myVote", default: 0 }, 'hot' ] );

        this.slug = slug;

        this.channel = channel;

        this.uuid = uuid;
        this.title = title;
        this.body = body;

        this.link = link;
        this.preview = preview;
        this.author = author;
        this.owner = owner;

        this.country = country;

        this.date = date;

    }

    get id(){
        return this.slug.toLowerCase();
    }

}