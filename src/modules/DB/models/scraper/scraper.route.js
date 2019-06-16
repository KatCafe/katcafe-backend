import ScraperHelper from "./scraper-helper"

export default function (express) {

    express.get('/scraper/*', async function(req, res ) {

        try{

            let uri = req.params[0];

            const out = await ScraperHelper.getPreview(uri);

            if (!out) throw "invalid";

            res.json( {

                result: true,
                scrape : out,

            });

        }catch(err){
            res.status(500).json( err.toString() );
        }


    });

}