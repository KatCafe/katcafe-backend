import client from "./redis";

const epoch = new Date("1970/01/01").getTime();
const startingDate = new Date("2019/01/01").getTime();

export default class Model {

    constructor(table, fields) {

        this._table = table;
        this._fields = fields;

    }

    async exists(){

        const out = await client.hgetAsync( this._table, this.id );
        if (out) return true;

    }

    async save(){

        await client.hsetAsync( this._table, this.id.toLowerCase(), JSON.stringify(this.toJSON() ) );

        if (this.saveScore)
            await this.saveScore();

    }

    async load(){

        const out = await client.hgetAsync( this._table, this.id.toLowerCase());
        if (!out) return false;

        const json = JSON.parse(out);
        this.fromJSON(json);

        return true;
    }

    async delete() {

        await client.hdelAsync( this._table, this.id.toLowerCase());

        if (this.deleteScore)
            await this.deleteScore();

    }

    fromJSON(obj){

        for (const key of this._fields)
            this[key] = obj[key];

    }

    toJSON(){

        const obj = {};

        for (const key of this._fields)
            obj[key] = this[key];

        return obj;

    }

    get id(){
        throw "not defined";
    }

    _seconds(){
        let delta = ( this.date - epoch ) / 1000;

        // calculate (and subtract) whole days
        let days = Math.floor(delta / 86400);
        delta -= days * 86400;

        // calculate (and subtract) whole hours
        let hours = Math.floor(delta / 3600) % 24;
        delta -= hours * 3600;

        // calculate (and subtract) whole minutes
        let minutes = Math.floor(delta / 60) % 60;
        delta -= minutes * 60;

        // what's left is seconds
        let seconds = delta % 60;  // in theory the modulus is not required
        delta -= seconds;

        //return days;
        return days * 24*60 + hours*60 + minutes;
    }


    _score(){
        return 0;
    }

    hot(){
        const s = this._score();
        const order = Math.log( Math.max( Math.abs(s), 1) ) / Math.log(10);
        const sign = Math.sign( s );
        const seconds = this._seconds() - startingDate;
        return ( sign * order + seconds / 45000 ).toFixed( 7 );

    }

}