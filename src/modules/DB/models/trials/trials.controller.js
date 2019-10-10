import Trial from "./trial"
import StringHelper from "modules/helpers/string-helper";
import Controller from "../../controller";
import CaptchaController from "../captcha/captcha-controller";

class TrialsController extends Controller {

    constructor(){

        super('trial', Trial);

        this.resetTrials();
    }

    async _resetTrials(category, countName, time){

        try{

            const out = await this.loadAll();

            const promises = out.map( trial => {

                trial.count[countName] = Math.max(0, (trial.count[countName] || 0 ) - 1 ) ;

                if ( !trial.count['5m'] && !trial.count.h && !trial.count.d)
                    return trial.delete();

            });

            await Promise.all( promises );

        }catch(err){

        }

        setTimeout( this._resetTrials.bind(this, category, countName, time), time);
    }

    resetTrials(){

        this._resetTrials(this, '5m', 5*60*1000 );
        this._resetTrials(this, 'h', 60*60*1000 );
        this._resetTrials(this, 'd', 24*60*60*1000 );

    }

    async increaseTrialByIpAddress( {category, count = 1, maxCount = { '5m': 5, h: 10, d: 40} }, { auth, ipAddress } ){

        category = StringHelper.sanitizeText(category);
        if (typeof count !== "number") throw "count is not a number";

        let trial = new Trial(category, ipAddress);
        await trial.load();

        if (!trial.count) trial.count = {};

        trial.count['5m'] = (trial.count['5m'] || 0) + count;
        trial.count.h = (trial.count.h || 0) + count;
        trial.count.d = (trial.count.d || 0) + count;

        if (maxCount && this.isTrialBlocked({trial, maxCount}, {auth, ipAddress}, ))
            throw "too many trials";

        await trial.save();

        return trial;

    }

    async isTrialBlocked( {trial, category, maxCount = { '5m': 5, h: 10, d: 40}}, {auth, ipAddress} ){

        if (!trial){
            trial = new Trial( category, ipAddress );
            if ( await trial.load() === false ) return false;
        }


        if (trial)
            if (trial.count['5m'] >= maxCount['5m'] ||
                trial.count['h'] >= maxCount['h'] ||
                trial.count['d'] >= maxCount['d'] ) return true;

        return false;

    }

    async process({category, maxCount, captcha}, params){

        if (await this.isTrialBlocked({category, maxCount }, params) )
            await CaptchaController.captchaSolution( captcha.solution, captcha.encryption ) ;

        await this.increaseTrialByIpAddress({category, count: 1, maxCount: null}, params)

    }

    processSpamContent({captcha}, params){
        return this.process({category: 'spam:content', maxCount: { '5m': 5, h: 30, d: 200}, captcha, }, params);
    }

}

export default new TrialsController ();