import client from "modules/DB/redis"
import VoteModel from "./vote.model"
import StringHelper from "modules/helpers/string-helper";
import Model from "../../model";

export default class Vote extends VoteModel {

    constructor( slug, ip, value, date){
        super( slug, ip.toLowerCase(), value, date);
    }


}