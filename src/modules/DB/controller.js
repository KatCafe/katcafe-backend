import StringHelper from "../helpers/string-helper";
import client from "./redis";

class Controller{

    async getByRank(tabel='topics', classModel, revert = false, searchAlgorithm = 'hot', searchQuery, search, index, count, load){

        if (!index) index = 1;
        if ( !count ) count = 10;

        search = StringHelper.parseBody( (search || '').toLowerCase() );
        count = Math.min( count, 30);

        const out = await client[`z${revert ? 'rev' : ''}rangeAsync`]( `${tabel}:rank:${searchAlgorithm}:${searchQuery}${search ? ':'+search : ''}`, (index-1) * count, index*count-1 );

        if (!load) return out;

        const p = [], data = [];
        for (const slug of out){
            const obj = new classModel(slug);
            p.push( obj.load() );
            data.push(obj);
        }

        await Promise.all(p);

        return data;
    }

}

export default Controller;