import Controller from "../../controller";
import Channel from "./channel";

class ChannelsController extends Controller{

    async getByRank(revert , searchAlgorithm , searchQuery, search, index, count, load){

        return Controller.prototype.getByRank.call(this, 'channels', Channel, revert, searchAlgorithm, searchQuery, search, index, count, load );

    }

}

export default new ChannelsController();