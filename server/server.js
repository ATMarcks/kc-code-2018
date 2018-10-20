let express = require('express')
let history = require('connect-history-api-fallback')
let path = require('path')
let Sentiment = require('sentiment');
let scrapeTwitter = require('scrape-twitter')
let port = process.env.PORT || 80

let app = express()
let sentiment = new Sentiment();

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
    let unreadTweets = []; // Clear out our tweets
    let unreadTweetsToShow = [];

    const hashtag = req.query.hashtag;
    let topTweets = new scrapeTwitter.TweetStream('#' + hashtag, 'top', 100);
    let newTweets = new scrapeTwitter.TweetStream('#' + hashtag, 'latest', 100);

    let semanticAnalysisTwitter = {
        'samples': 0,
        'scoreSum': 0
    };

    newTweets.on('data', (chunk) => {
        unreadTweets.push({
                'time': chunk.time,
                'text': chunk.text,
                'retweets': chunk.retweetCount,
                'favorites': chunk.favoriteCount
            });
        if (unreadTweets.length === 150) {
            newTweets.destroy();
            topTweets.destroy();
            unreadTweets.forEach(tweet => {
                const senRes = sentiment.analyze(tweet.text);
                semanticAnalysisTwitter.samples += 1;
                semanticAnalysisTwitter.scoreSum += (senRes.score + 5) * 10;
            });
            unreadTweetsToShow = unreadTweetsToShow.sort(() => .5 - Math.random()).slice(0,9);
            res.status(200).send({
                'semanticScore': semanticAnalysisTwitter.scoreSum/ semanticAnalysisTwitter.samples,
                'tweets': unreadTweetsToShow
            })
        }
    });

    topTweets.on('data', (chunk) => {
        unreadTweetsToShow.push({
            'time': chunk.time,
            'text': chunk.text,
            'retweets': chunk.retweetCount,
            'favorites': chunk.favoriteCount
        });
        unreadTweets.push({
            'time': chunk.time,
            'text': chunk.text,
            'retweets': chunk.retweetCount,
            'favorites': chunk.favoriteCount
        });
        if (unreadTweets.length === 150) {
            newTweets.destroy();
            topTweets.destroy();
            unreadTweets.forEach(tweet => {
                const senRes = sentiment.analyze(tweet.text);
                semanticAnalysisTwitter.samples += 1;
                semanticAnalysisTwitter.scoreSum += (senRes.score + 5) * 10;
            });
            unreadTweetsToShow = unreadTweetsToShow.sort(() => .5 - Math.random()).slice(0,9);
            res.status(200).send({
                'semanticScore': semanticAnalysisTwitter.scoreSum/ semanticAnalysisTwitter.samples,
                'tweets': unreadTweetsToShow
            })
        }
    });
});

app.listen(port)
