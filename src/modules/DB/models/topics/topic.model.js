import Model from "modules/DB/model"

export default class TopicModel extends Model {

    constructor( slug, channel, uuid, title, link, preview, body, isAnonymous, owner, country, ip, date ){

        super( 'topic', [ 'slug', 'channel', 'uuid', 'title','link', 'body', 'isAnonymous', 'preview', 'owner', 'country', 'ip', 'date',
                          {name: 'votesUp', default: 0}, {name: 'votesDown', default: 0}],

               ['comments', {name: 'myVote', default: undefined }, 'hot' ] );

        this.slug = slug;

        this.channel = channel;

        this.uuid = uuid;
        this.title = title;
        this.body = body;

        this.link = link;
        this.preview = preview;
        this.isAnonymous = isAnonymous;
        this.owner = owner;
        this.ip = ip;

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

            if (!hasRights) {
                delete out.isAnonymous;
                delete out.ip;
            }

        }

        return out;

    }


}