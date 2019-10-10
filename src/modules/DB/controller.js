import StringHelper from "../helpers/string-helper";
import client from "./redis";

import VotesController from "./models/votes/votes.controller"
import SessionController from "./models/auth/sessions/session-controller";
import Topic from "./models/topics/topic";
import Channel from "./models/channels/channel";

class Controller{

    constructor(table='table', modelClass = undefined){
        this._table = table;
        this._class = modelClass;
    }

    async createModel(model){

        if ( await model.exists() )
            throw "Already exists";

        await model.save();

        return model;

    }

    async getByRank( classModel, revert = false, searchAlgorithm = 'hot', searchQuery, search, index, count, load, req){

        if ( !index ) index = 1;
        if ( !count ) count = 10;

        search = decodeURI( (search || '').toLowerCase() );
        count = Math.min( count, 30);

        const out = await client[ `z${ revert ? 'rev' : '' }rangeAsync` ]( `${this._table}:rank:${searchAlgorithm}:${searchQuery}${search ? ':'+search : ''}`, (index-1) * count, index*count-1 );

        if (!load) return out;

        const p = [], data = [];

        for (const slug of out){
            const obj = new classModel( slug );
            p.push( obj.load() );
            data.push( obj );
        }

        await Promise.all( p );

        if (req){

            const outVotes = await Promise.all( data.map (data => VotesController.getVote( data.slug, req )) );
            data.map( (it, index) => it.myVote = outVotes[index] );

        }

        return data;
    }

    async deleteModel({auth, slug}, additionalLoading ) {

        if (!auth) throw "You must be logged in";

        const object = new this._class(slug);
        if (await object.load() === false) throw "Data was not found";

        let objects = [];
        if (additionalLoading) objects = await additionalLoading( object );

        if (!auth.isUserOwner( [ object, ...objects ] )) throw "No rights";

        return object.delete();


    }

    async getAllIds(){

        let list = [];

        let index = 0;
        do {
            const out = await client.sscanAsync(this._table+'s:list', index);
            index = Number.parseInt(out[0]);

            out[1].map(it => list.push(it));
        } while (index !== 0);

        return list;
    }

    async loadAll(filter){

        let list = await this.getAllIds();

        if (filter) list = list.filter( filter );

        const models = [];
        const promises = list.map( it => {
            const model = new this._class(it);
            models.push(model);
            return model.load();
        } );

        await Promise.all(promises);

        return models;

    }

    async loadAllAndFix(filter){

        let list = await this.getAllIds();

        if (filter) list = list.filter( filter );

        let models = list.map( async it => {
            const model = new this._class(it);
            const out = await model.load();

            if (!out) model.delete();
            return model;
        } );

        models = models.filter(it => it);

        return Promise.all(models);

    }

}

export default Controller;