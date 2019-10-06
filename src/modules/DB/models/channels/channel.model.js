import Model from 'modules/DB/model'
import client from '../../redis';

export default class ChannelModel extends Model {

    constructor( slug, name, title, icon, cover, owner, country, ip, date){

        super( 'channel', [ 'slug', 'name','title','icon','cover', 'owner', 'country', 'ip', 'date' ],
               [ 'topics', 'hot' ]);

        this.slug = slug;

        this.name = name;
        this.title = title;
        this.icon = icon;
        this.cover = cover;
        this.owner = owner;
        this.country = country;
        this.ip = ip;

        this.date = date;
    }

    get id(){
        return this.slug;
    }

    async load(){

        const promises = [
            super.load.call(this),
            client.zcardAsync('topics:rank:date:channel:'+this.id.toLowerCase() )
        ];
        const out = await Promise.all(promises);

        if (!out[0]) return false;

        this.topics = out[1] || 0;

        return this;
    }

}