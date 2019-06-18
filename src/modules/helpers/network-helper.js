const rp = require('request-promise');

class NetworkHelper {

    async post( uri, body, json = true, timeout = 10000 ){

        return rp({
            uri,
            headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36' },
            json,
            timeout,
            method: "POST",
            body
        });

    }

    async get( uri, body, json = true, timeout = 10000, encoding){

        return rp({
            uri,
            headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36' },
            json,
            timeout,
            body,
            encoding,
        });

    }

}

export default new NetworkHelper();