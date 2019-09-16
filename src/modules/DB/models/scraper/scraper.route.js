import ScraperHelper from "./scraper-controller"
import StringHelper from "modules/helpers/string-helper";

export default function (express) {

    express.post('/scraper/get', async function(req, res ) {

        try{

            let {uri} = req.body;
            uri = StringHelper.parseBody(uri);

            const out = await ScraperHelper.getPreview(uri);

            if (!out) throw "invalid";

            res.json( {

                scrape : out,

            });

        }catch(err){
            res.status(500).json( err.toString() );
        }


    });

}