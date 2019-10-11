import Trial from "./trial"
import StringHelper from "modules/helpers/string-helper";
import Controller from "../../controller";
import CaptchaController from "../captcha/captcha-controller";
import client from "../../redis";

const MaxCountsPrefixes = ['2m', '5m','h','d'];

const MaxCounts = {
    'spam:cmt': ({auth}) => ({ '2m': auth ? 5 : 2, '5m': auth ? 10 : 3, h: auth ? 20 : 5, d: auth ? 200 : 20}),
    'spam:tpc': ({auth}) => ({ '2m': auth ? 2 : 1, '5m': auth ? 3 : 1, h: auth ? 12 : 3, d: auth ? 20 : 5}),
};

class TrialsController extends Controller {

    constructor(){

        super('trial', Trial);

        client.on("connect",  (err) => {
            this._resetTrials();
        });
    }

    async _resetTrialsFct( countName, time, process=true){

        if (process)
        try{

            const out = await this.loadAll(undefined, countName);

            const promises = out.map( trial => {

                trial.count = Math.max( 0, trial.count - 1);
                if (!trial.count)
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

        clearTimeout(this['_timeout'+'2m']);
        clearTimeout(this['_timeout'+'5m']);
        clearTimeout(this['_timeout'+'h']);
        clearTimeout(this['_timeout'+'d']);

        this._resetTrialsFct('2m', 2*60*1000, false );
        this._resetTrialsFct('5m', 5*60*1000, false );
        this._resetTrialsFct( 'h', 60*60*1000, false );
        this._resetTrialsFct('d', 24*60*60*1000, false );

    }

    async _increaseTrialByIpAddress( {category, count = 1, maxCount }, { auth, ipAddress } ){

        category = StringHelper.sanitizeText(category);
        if (typeof count !== "number") throw "count is not a number";

        let trials = await Promise.all(['2m','5m','h','d'].map(it => {
            let trial = new Trial(category, auth ? auth.username : ipAddress, it );
            return trial.load();
        }));

        trials = trials.map( (it,index) => it ? it : new Trial(category, auth ? auth.username : ipAddress, MaxCountsPrefixes[index] ) );

        trials.map ( it => it.count = (it.count||0) + 1);

        if (maxCount !== "none" && this.isTrialBlocked( { trials, maxCount}, {auth, ipAddress}, ))
            throw "too many trials";

        return Promise.all( trials.map( it => it.save() ) );

    }

    async isTrialBlocked( {trials, category, maxCount}, {auth, ipAddress} ){

        if (!trials){
            trials = await Promise.all( ['2m','5m','h','d'].map(it => {
                let trial = new Trial(category, auth ? auth.username : ipAddress, it );
                return trial.load();
            }));
        }

        if (!maxCount) maxCount = MaxCounts[category];

        if (typeof maxCount === "function") maxCount = maxCount( {auth, ipAddress} );

        for (let i=0; i < MaxCountsPrefixes.length; i++)
            if (trials[i] && trials[i].count >= maxCount[MaxCountsPrefixes[i]]) return true;

        return false;

    }

    async process({category, maxCount, captcha}, params){

        if (await this.isTrialBlocked({category, maxCount }, params) )
            await CaptchaController.captchaSolution( captcha.solution, captcha.encryption ) ;

        await this._increaseTrialByIpAddress({category, count: 1, maxCount: 'none'}, params)

    }


}

export default new TrialsController ();