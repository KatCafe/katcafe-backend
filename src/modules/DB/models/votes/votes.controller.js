import Vote from "./vote";

class VotesController {

    async getVote( slug, req ){

        let ip;
        if (typeof req === "string")
            ip = req;
        else
        if (typeof req === "object" && ( req.headers || req.connection)  )
            ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        const vote = new Vote(slug, ip );
        if ( await vote.load()  )
            return vote.value;

        return 0;

    }

}

export default new VotesController ();