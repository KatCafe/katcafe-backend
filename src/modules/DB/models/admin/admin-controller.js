import UserRole from "./../auth/users/user-role"
import ChannelsController from "../channels/channels.controller"
import TopicsController from "../topics/topics.controller"
import CommentsController from "../comments/comments.controller"
import StringHelper from "modules/helpers/string-helper";

class AdminController{

    async removeWrongData({channels}, auth){

        if (!auth || auth.role !== UserRole.SYS_ADMIN) throw "You don't have SYS_ADMIN privileges";

        if (!Array.isArray(channels) && !channels) channels = [channels];

        if (!channels || channels.length === 0 )
            channels = await ChannelsController.getAllIds();

        let topics = await TopicsController.loadAllAndFix( it => StringHelper.verifyStringExistsInArray( channels, it ) );
        topics = topics.filter( it => !it.channel || !it.country );

        await Promise.all( topics.map( it => it.delete() ) );

        let comments = await CommentsController.loadAllAndFix( it => StringHelper.verifyStringExistsInArray( channels, it ) );
        comments = comments.filter( it => !it.topic || !it.channel || !it.country);

        await Promise.all ( comments.map( it => it.delete() ) );

        return {topics: topics.length, comments: comments.length};
    }

    async updatesScores({channels }, auth){

        if (!auth || auth.role !== UserRole.SYS_ADMIN) throw "You don't have SYS_ADMIN privileges";

        if (!Array.isArray(channels) && !channels) channels = [channels];

        if (!channels || channels.length === 0 )
            channels = await ChannelsController.getAllIds();


        //const topics
        let topics = await TopicsController.loadAll( it => StringHelper.verifyStringExistsInArray( channels, it ) );
        let comments = await CommentsController.loadAll( it => StringHelper.verifyStringExistsInArray( channels, it ) );

        await topics.map( it => it.saveScore() );
        await comments.map( it => it.saveScore() );

        await Promise.all( [
            ...topics.map( it => it.saveScore() ),
            ...comments.map( it => it.saveScore() ),
        ]);

    }

}

export default new AdminController();