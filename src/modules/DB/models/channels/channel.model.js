import Model from "modules/DB/model"
import client from "../../redis";

export default class ChannelModel extends Model {

    constructor( slug, name, title, icon, cover, owner, country, date){

        super( "channel", [ "slug", "name","title","icon","cover", "owner", "country", "date" ],
               [ "topics" ]);

        this.slug = slug;

        this.name = name;
        this.title = title;
        this.icon = icon;
        this.cover = cover;
        this.owner = owner;
        this.country = country;

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

        this.topics = out[1] || 0;

    }

}