const debug = true;

export default {

    DEBUG: debug,
    PORT: 8085,
    DOMAIN: debug ? "http://127.0.0.1:8080" : "https://katcafe.org",

    SITEMAP: debug ? true : false,

};
