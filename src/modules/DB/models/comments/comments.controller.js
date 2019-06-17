import Controller from "../../controller";
import Comment from "./comment";

class CommentsController extends Controller{

    async getByRank(revert , searchAlgorithm , searchQuery, search, index, count, load){

        return Controller.prototype.getByRank.call(this, 'comments', Comment, revert, searchAlgorithm, searchQuery, search, index, count, load );

    }

}

export default new CommentsController();