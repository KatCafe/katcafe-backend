//const pnormaldist = require('pnormaldist'); //get it

import client from "./redis";

const epoch = new Date("1970/01/01").getTime();
const startingDate = new Date("2019/01/01").getTime()/1000;

export default class Model {

    constructor(table, fields = [], fieldsAdditionalToJSON = [], fieldsHiddenToJSON = {}) {

        this._table = table;
        this._fields = fields;
        this._fieldsAdditionalToJSON = fieldsAdditionalToJSON;
        this._fieldsHiddenToJSON = fieldsHiddenToJSON;

    }

    async exists(){

        const out = await client.hgetAsync( this._table, this.id );
        return !!out;
    }

    async save(){

        await client.hsetAsync( this._table, this.id.toLowerCase(), JSON.stringify(this.toJSON( true ) ) );

        if (this.saveScore)
            await this.saveScore();

    }

    async load(){

        const out = await client.hgetAsync( this._table, this.id.toLowerCase());
        if (!out) return false;

        const json = JSON.parse(out);
        this.fromJSON(json);

        return this;
    }

    async delete() {

        await client.hdelAsync( this._table, this.id.toLowerCase());

        if (this.deleteScore)
            await this.deleteScore();

        return this;
    }

    fromJSON(obj){

        for (const key of this._fields) {

            let finalKey = key;

            if (typeof key === "object")
                finalKey = key.name;

            this[finalKey] = obj[finalKey];
        }

    }

    toJSON(save = false){

        const obj = {};

        const processFields = ( data, fields ) => {

            if (!fields) return;

            for (const key of fields) {

                if (!save && this._fieldsHiddenToJSON[key] )
                    continue;

                let defaultValue, finalKey = key;

                if (typeof key === "object"){
                    finalKey = key.name;
                    defaultValue = key.default;
                }

                let out = data [finalKey] ;

                if (defaultValue) out = out || defaultValue;

                if ( typeof out === "function" ) out = out.call(this);

                obj[finalKey] = out;
            }

        };

        processFields( this, this._fields );

        if (!save)
            processFields(  this, this._fieldsAdditionalToJSON );

        return obj;

    }

    get id(){
        throw "not defined";
    }

    _seconds(){

        let delta = ( this.date - epoch ) / 1000;

        // calculate (and subtract) whole days
        const days = Math.floor(delta / 86400);
        delta -= days * 86400;

        // calculate (and subtract) whole hours
        const hours = Math.floor(delta / 3600) % 24;
        delta -= hours * 3600;

        // calculate (and subtract) whole minutes
        const minutes = Math.floor(delta / 60) % 60;
        delta -= minutes * 60;

        // what's left is seconds
        let seconds = delta % 60;  // in theory the modulus is not required
        delta -= seconds;

        //return days;
        return days * 24*60*60 + hours*60*60 + minutes*60 + seconds;
    }


    _score(){
        return 0;
    }

    hot(){

        const s = this._score() ;
        const sign = Math.sign(s);

        const order = Math.log10(  Math.abs(s)+1 );
        const seconds = this._seconds() - startingDate;

        return Number.parseFloat( ( sign * order + seconds / 45000 ).toFixed( 7 ) );

    }

    confidence(ups = 0, downs = 0){

        const n = ups + downs;

        if ( n === 0 ) return 0;

        const z = 1.281551565545;
        const p = ups / n;

        const left = p + 1/(2*n)*z*z;
        const right = z*Math.sqrt(p*(1-p)/n + z*z/(4*n*n));
        const under = 1+1/n*z*z;

        return (left - right) / under;
    }

}