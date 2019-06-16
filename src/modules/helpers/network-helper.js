const rp = require('request-promise');

class NetworkHelper {

    async post( uri, body, json = true, timeout = 10000 ){

        return rp({
            uri,
            headers: { 'User-Agent': 'Request-Promise' },
            json,
            timeout,
            method: "POST",
            body
        });

    }

    async get( uri, body, json = true, timeout = 10000, encoding){

        return rp({
            uri,
            headers: { 'User-Agent': 'Request-Promise' },
            json,
            timeout,
            body,
            encoding,
        });

    }

}

export default new NetworkHelper();