import Trial from "./trial"
import StringHelper from "modules/helpers/string-helper";
import Controller from "../../controller";
import CaptchaController from "../captcha/captcha-controller";
import client from "../../redis";

const MaxCounts = {
    'spam:content': ({auth}) => ({ '5m': auth ? 5 : 1, h: auth ? 30 : 5, d: auth ? 200 : 10})
};

class TrialsController extends Controller {

    constructor(){

        super('trial', Trial);

        client.on("connect",  (err) => {
            this._resetTrials();
        });
    }

    async _resetTrialsFct( countName, time){

        try{

            const out = await this.loadAll();

            const promises = out.map( trial => {

                trial.count[countName] = Math.max(0, (trial.count[countName] || 0 ) - 1 ) ;

                if ( !trial.count['5m'] && !trial.count.h && !trial.count.d)
                    return trial.delete();
                else
                    return trial.save();

            });

            await Promise.all( promises );

        }catch(err){
            console.error("_resetTrialsFct", err);
        }

        this['_timeout'+countName] = setTimeout( this._resetTrialsFct.bind(this, countName, time), time);
    }

    _resetTrials(){

        clearTimeout(this['_timeout'+'5m']);
        clearTimeout(this['_timeout'+'h']);
        clearTimeout(this['_timeout'+'d']);

        this._resetTrialsFct('5m', 5*60*1000 );
        this._resetTrialsFct( 'h', 60*60*1000 );
        this._resetTrialsFct('d', 24*60*60*1000 );

    }

    async _increaseTrialByIpAddress( {category, count = 1, maxCount }, { auth, ipAddress } ){

        category = StringHelper.sanitizeText(category);
        if (typeof count !== "number") throw "count is not a number";

        let trial = new Trial(category, ipAddress);
        await trial.load();

        if (!trial.count) trial.count = {};

        trial.count['5m'] = (trial.count['5m'] || 0) + count;
        trial.count.h = (trial.count.h || 0) + count;
        trial.count.d = (trial.count.d || 0) + count;

        if (maxCount !== "none" && this.isTrialBlocked({trial, maxCount}, {auth, ipAddress}, ))
            throw "too many trials";

        await trial.save();

        return trial;

    }

    async isTrialBlocked( {trial, category, maxCount = { '5m': 5, h: 10, d: 40}}, {auth, ipAddress} ){

        if (!trial){
            trial = new Trial( category, ipAddress );
            if ( await trial.load() === false ) return false;
        }

        if (!maxCount) maxCount = MaxCounts[category];

        if (typeof maxCount === "function") maxCount = maxCount(auth, ipAddress);

        if (trial)
            if (trial.count['5m'] >= maxCount['5m'] ||
                trial.count['h'] >= maxCount['h'] ||
                trial.count['d'] >= maxCount['d'] ) return true;

        return false;

    }

    async process({category, maxCount, captcha}, params){

        if (await this.isTrialBlocked({category, maxCount }, params) )
            await CaptchaController.captchaSolution( captcha.solution, captcha.encryption ) ;

        await this._increaseTrialByIpAddress({category, count: 1, maxCount: 'none'}, params)

    }


}

export default new TrialsController ();