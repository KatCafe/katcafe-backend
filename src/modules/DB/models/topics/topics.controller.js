import Controller from "../../controller";
import Topic from "./topic";

class TopicsController extends Controller{

    async getByRank(revert , searchAlgorithm , searchQuery, search, index, count, load, req){

        return Controller.prototype.getByRank.call(this, 'topics', Topic, revert, searchAlgorithm, searchQuery, search, index, count, load, req );

    }

}

export default new TopicsController();