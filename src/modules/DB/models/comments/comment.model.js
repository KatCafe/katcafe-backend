import Model from "modules/DB/model"

export default class CommentModel extends Model {

    constructor( slug, topic, channel, uuid, body, link, preview, isAnonymous, owner, country, date){

        super( "comment", ["slug", "topic", "uuid", "body","link", "preview", "channel", "isAnonymous", 'owner', "country", "date",
                           {name: "votesUp", default: 0}, {name: "votesDown", default: 0}],
                [ {name: "myVote", default: undefined }, 'hot' ] );

        this.slug = slug;

        this.topic = topic;
        this.channel = channel;

        this.uuid = uuid;
        this.body = body;
        this.link = link;
        this.preview = preview;
        this.isAnonymous = isAnonymous;
        this.owner = owner;

        this.country = country;

        this.date = date;

    }

    get id(){
        return this.slug.toLowerCase();
    }


    toJSON(save = false, userAuth){

        const out = super.toJSON(save);

        if (!save) {

            const hasRights = (userAuth && userAuth.isUserOwner(this, 'owner'));

            if ( this.isAnonymous !== false && !hasRights) delete out.owner;
            if (!hasRights) delete out.isAnonymous;

        }

        return out;

    }

}