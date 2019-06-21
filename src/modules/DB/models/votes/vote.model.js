import Model from "modules/DB/model"

export default class VoteModel extends Model {

    constructor( slug, ip, value, date ){

        super( "vote", [ "slug", "ip" , "value", "date" ], [] );

        this.slug = slug;
        this.ip = ip;
        this.value = value;
        this.date = date;

    }

    get id(){
        return this.slug.toLowerCase() + this.ip.toLowerCase();
    }

}