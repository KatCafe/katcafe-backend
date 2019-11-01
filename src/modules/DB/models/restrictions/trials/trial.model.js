import Model from "modules/DB/model"
import client from "../../../redis";

export default class Trial extends Model {

    // 'spam:post' 'x.x.x.x', 0,

    constructor( category, name, counter, count, date ){

        super( "trial", [  'category', 'name', 'counter', 'count', 'date' ], [] );

        this.category = category;
        this.name = name;
        this.counter = counter;
        this.count = count;

        this.date = date;

    }

    async saveScore() {
        await client.saddAsync(this._table + "s:"+this.counter+":list", this.id);
    }

    async deleteScore() {
        client.sremAsync(this._table + "s:"+this.counter+":list", this.id);
    }


}