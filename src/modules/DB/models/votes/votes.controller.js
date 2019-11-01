import Vote from "./vote";
import Comment from "../comments/comment";
import Topic from "../topics/topic";
import StringHelper from "modules/helpers/string-helper";

class VotesController {

    async vote( {slug='', value, parentType}, {auth, ipAddress}){

        slug = StringHelper.sanitizeText(slug);

        if (value !== -1 && value !== 0 && value !== 1) throw "value is invalid";
        if (parentType !== 'comment' && parentType !== 'topic') throw "parenType is invalid";

        let vote = new Vote( slug, ipAddress, value );

        let prevVote = 0;

        if ( await vote.load() ){

            prevVote = vote.value;

            if (prevVote === value )
                return {vote, prevVote};
            else {

                if (prevVote && prevVote !== 0)
                    value = 0;

            }

            vote.date = new Date().getTime();
            vote.value = value;

        }

        let model;

        if (parentType === "comment") model = new Comment(slug); else
        if (parentType === "topic") model = new Topic(slug);

        if (await model.load() === false ) throw "Parent was not found";

        if (prevVote === -1) model.votesDown = (model.votesDown || 0) - 1;
        if (prevVote === 1) model.votesUp = (model.votesUp || 0) -1;

        if (vote.value === -1) model.votesDown = (model.votesDown || 0) + 1;
        if (vote.value === 1) model.votesUp = (model.votesUp || 0) + 1;

        await model.save();
        await vote.save();

        return {vote, prevVote};

    }

    async getVote( slug, {auth, ipAddress} ){

        const vote = new Vote(slug, ipAddress );
        if ( await vote.load()  )
            return vote.value;

        return 0;

    }

}

export default new VotesController ();