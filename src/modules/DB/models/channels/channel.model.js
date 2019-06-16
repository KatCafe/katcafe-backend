import Model from "modules/DB/model"

export default class ChannelModel extends Model {

    constructor( slug, name, title, icon, cover, country, date){

        super( "channel", ["slug", "name","title","icon","cover", "country", "date"] );

        this.slug = slug;

        this.name = name;
        this.title = title;
        this.icon = icon;
        this.cover = cover;
        this.country = country;


        this.date = date;


    }

    get id(){
        return this.slug;
    }

}