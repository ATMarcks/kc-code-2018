let express = require('express')
let history = require('connect-history-api-fallback')
let path = require('path')
let http = require('http');
let scrapeTwitter = require('scrape-twitter')
let port = process.env.PORT || 80

let unreadTweets = [];

let app = express()

// Allow CORS if in development
// Serve static files if in prod
if (process.env.NODE_ENV === 'development') {
    app.use(function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        next()
    })
} else {
    // ^ `app.use() is included twice intentionally as per https://github.com/bripkens/connect-history-api-fallback/blob/master/examples/static-files-and-index-rewrite/README.md#configuring-the-middleware
    app.use(express.static(path.join(__dirname, '..')))
    app.use('/assets', express.static(path.join(__dirname, '../src/assets')))
    app.use(history({
        disableDotRule: true
    }))
    app.use(express.static(path.join(__dirname, '..')))
    app.use('/assets', express.static(path.join(__dirname, '../src/assets')))
}

app.get('/api/test', (req, res) => {
    res.status(200).send(
        JSON.stringify({ 'str': 'success' })
    )
})

app.get('/api/gettwitterdata', (req, res) => {
    const hashtag = req.query.hashtag;
    let tweets = new scrapeTwitter.TweetStream('#' + hashtag, 'latest', 50);

    tweets.on('data', (chunk) => {
        console.log(chunk);
        // writable.write(chunk);
    });

    let read = tweets.read();
    console.log(read);
});

app.listen(port)
