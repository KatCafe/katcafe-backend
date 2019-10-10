import Model from "modules/DB/model"
import client from "../../redis";

export default class Trial extends Model {

    // 'spam:post' 'x.x.x.x', 0,

    constructor( category, name, count ){

        super( "trial", [  'category', 'name', 'count', 'date' ], [] );

        this.category = category;
        this.name = name;
        this.count = count;

    }

    async saveScore() {
        await client.saddAsync(this._table + "s:list", this.id);
    }

    async deleteScore() {
        client.sremAsync(this._table + "s:list", this.id);
    }


}