import client from "modules/DB/redis"
import TrialModel from "./trial.model"
import StringHelper from "modules/helpers/string-helper";
import Model from "../../model";

export default class Trial extends TrialModel {

    constructor( category, name, count = {}, date = new Date().getTime() ){
        super( category.toLowerCase(), name.toLowerCase(), count, date);
    }

    get id(){
        return this.category.toLowerCase() + ':' + this.name.toLowerCase();
    }

}