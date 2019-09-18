import StringHelper from "../helpers/string-helper";
import client from "./redis";

import VotesController from "./models/votes/votes.controller"

class Controller{

    constructor(table='table'){
        this.table = table;
    }

    async createModel(model){

        if ( await model.exists() )
            throw "Already exists";

        await model.save();

        return model;

    }

    async getByRank( classModel, revert = false, searchAlgorithm = 'hot', searchQuery, search, index, count, load, req){

        if (!index) index = 1;
        if ( !count ) count = 10;

        search = decodeURI( (search || '').toLowerCase() );
        count = Math.min( count, 30);

        const out = await client[`z${revert ? 'rev' : ''}rangeAsync`]( `${this.table}:rank:${searchAlgorithm}:${searchQuery}${search ? ':'+search : ''}`, (index-1) * count, index*count-1 );

        if (!load) return out;

        const p = [], data = [];
        for (const slug of out){
            const obj = new classModel(slug);
            p.push( obj.load() );
            data.push(obj);
        }

        await Promise.all(p);

        if (req){

            const outVotes = await Promise.all( data.map (data => VotesController.getVote( data.slug, req )) );
            data.map( (it, index) => it.myVote = outVotes[index] );

        }

        return data;
    }

}

export default Controller;