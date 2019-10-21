import TrialsController from "./trials.controller"

export default function (express){

    express.post( '/trials/is-blocked', async function(req, res ) {

        try{

            const out = await TrialsController.isTrialBlocked( req.body, req);

            res.json({ out });


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

    express.post( '/trials/block-user', async function(req, res ) {

        try{

            const out = await TrialsController.blockDays(req.body, req);
            res.json({out});

        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

}