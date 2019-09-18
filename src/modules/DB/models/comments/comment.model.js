import Model from "modules/DB/model"

export default class CommentModel extends Model {

    constructor( slug, topic, channel, uuid, body, link, preview, author, owner, country, date){

        super( "comment", ["slug", "topic", "uuid", "body","link", "preview", "channel", "author", 'owner', "country", "date",
                           {name: "votesUp", default: 0}, {name: "votesDown", default: 0}],
                [ {name: "myVote", defualt: 0 } ] );

        this.slug = slug;

        this.topic = topic;
        this.channel = channel;

        this.uuid = uuid;
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