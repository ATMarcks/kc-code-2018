let express = require('express');
let history = require('connect-history-api-fallback');
let path = require('path');
let https = require('https');
let Filter = require('bad-words');
let instagram = require('instagram-nodejs-without-api');
let Sentiment = require('sentiment');
let scrapeTwitter = require('scrape-twitter');
let port = process.env.PORT || 80;

Instagram = new instagram();
filter = new Filter();

let app = express();
let sentiment = new Sentiment();

const exclude = ['win', 'giveaway', 'download']

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
    let topTweetsEnd = false;
    let newTweetsEnd = false;

    const hashtag = req.query.hashtag;
    let topTweets = new scrapeTwitter.TweetStream('#' + hashtag, 'top', 100);
    let newTweets = new scrapeTwitter.TweetStream('#' + hashtag, 'latest', 100);

    let semanticAnalysisTwitter = {
        'samples': 0,
        'scoreSum': 0
    };

    newTweets.on('data', (chunk) => {
        if (!checkIfSubstrInStr(chunk.text, exclude)) {
            unreadTweets.push({
                'time': chunk.time,
                'text': chunk.text,
                'id': chunk.id,
                'screenName': chunk.screenName,
                'retweetCount': chunk.retweetCount,
                'favoriteCount': chunk.favoriteCount
            });
        }

        if (unreadTweets.length === 150) {
            twitterParse(newTweets, topTweets, unreadTweets, unreadTweetsToShow, semanticAnalysisTwitter, res);
        }
    });

    newTweets.on('end', () => {
        newTweetsEnd = true;
        if (topTweetsEnd) {
            twitterParse(newTweets, topTweets, unreadTweets, unreadTweetsToShow, semanticAnalysisTwitter, res);
        }
    });

    topTweets.on('end', () => {
        topTweetsEnd = true;
        if (newTweetsEnd) {
            twitterParse(newTweets, topTweets, unreadTweets, unreadTweetsToShow, semanticAnalysisTwitter, res);
        }
    });

    topTweets.on('data', (chunk) => {
        if (!checkIfSubstrInStr(chunk.text, exclude)) {
            unreadTweetsToShow.push({
                'time': new Date(chunk.time).getTime() / 1000,
                'text': chunk.text,
                'id': chunk.id,
                'screenName': chunk.screenName,
                'retweetCount': chunk.retweetCount,
                'favoriteCount': chunk.favoriteCount
            });
            unreadTweets.push({
                'time': chunk.time,
                'text': chunk.text,
                'id': chunk.id,
                'screenName': chunk.screenName,
                'retweetCount': chunk.retweetCount,
                'favoriteCount': chunk.favoriteCount
            });
        }

        if (unreadTweets.length === 150) {
            twitterParse(newTweets, topTweets, unreadTweets, unreadTweetsToShow, semanticAnalysisTwitter, res);
        }
    });
});

app.get('/api/gettumblrdata', (req, res) => {
    const tag = req.query.tag;
    const tumblrPosts = [];

    let semanticAnalysisTumblr = {
        'samples': 0,
        'scoreSum': 0
    };

    https.get('https://api.tumblr.com/v2/tagged?tag=' + tag + '&filter=text&api_key=sRwdivS37Z30JHMXjKezO0Y5awC92OX9TF2sRHAn1JET1H4DiC', (resp) => {
        resp.setEncoding('utf8');
        let resJson = '';

        resp.on('data', body => {
            resJson += body;
        });

        let note_count = 0;

        resp.on('end', () => {
            let resObj = JSON.parse(resJson);
            resObj.response.forEach(post => {
                if (post.body && !checkIfSubstrInStr(post.body, exclude)) {
                    tumblrPosts.push({
                        'time': post.timestamp,
                        'text': post.body,
                        'short_url': post.short_url,
                        'note_count': post.note_count
                    });
                    const senRes = sentiment.analyze((post.body || '').replace('#', ''));
                    semanticAnalysisTumblr.samples += 1;
                    semanticAnalysisTumblr.scoreSum += (senRes.score + 5) * 10;
                    note_count += post.note_count;
                }
            });

            let averageNoteCount = Math.round(note_count / tumblrPosts.length * 100) / 100;

            let semScore = semanticAnalysisTumblr.scoreSum/ semanticAnalysisTumblr.samples;
            if (semScore > 100) semScore = 100;
            if (semScore < 0) semScore = 0;
            res.status(200).send({
                'success': true,
                'averageNotes': averageNoteCount,
                'semanticScore': semScore,
                'blogs': cleanText(tumblrPosts.sort(() => .5 - Math.random()).slice(0,9) || [])
            });
        });
    }).on('error', (err) => {
        res.status(500).send({
            'success': false,
            'error': 'Could not connect to Tumblr'
        });
    });
});

app.get('/api/getinstagramdata', (req, res) => {
    const tag = req.query.tag;

    let semanticAnalysisInstagram = {
        'samples': 0,
        'scoreSum': 0
    };

    Instagram.searchBy('hashtag', tag).then(r => {
        const postsPreParse = r.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_media.edges;
        let posts = [];
        let numberOfLikes = 0;

        postsPreParse.forEach(post => {
            if ('node' in post && 'edge_media_to_caption' in post.node && 'edges' in post.node.edge_media_to_caption && post.node.edge_media_to_caption.edges.length !== 0) {
                if (!checkIfSubstrInStr(post.node.edge_media_to_caption.edges[0].node.text || '', exclude)) {
                    posts.push({
                        'time': post.node.taken_at_timestamp,
                        'text': post.node.edge_media_to_caption.edges[0].node.text || '',
                        'shortcode': post.node.shortcode,
                        'edge_liked_by': post.node.edge_liked_by.count
                    });
                    numberOfLikes += post.node.edge_liked_by.count;
                }
            }
        });

        posts.forEach(post => {
            if (post.text) {
                const senRes = sentiment.analyze((post.text || '').replace('#', ''));
                semanticAnalysisInstagram.samples += 1;
                semanticAnalysisInstagram.scoreSum += (senRes.score + 5) * 10;
            }
        });

        let averageLikes = Math.round(numberOfLikes / posts.length * 100) / 100;

        let semScore = semanticAnalysisInstagram.scoreSum/ semanticAnalysisInstagram.samples;
        if (semScore > 100) semScore = 100;
        if (semScore < 0) semScore = 0;
        res.status(200).send({
            'success': true,
            'averageLikes': averageLikes,
            'posts': cleanText(posts.sort(() => .5 - Math.random()).slice(0,9) || []),
            'semanticScore': semScore,
        });
    }).catch(err => {
        console.log('instagram error: ' + err);
        res.status(500).send({
            'success': false,
            'message': 'Failed to connect to Instagram'
        })
    })
});

function checkIfSubstrInStr(str, strArray) {
    for (let substr in strArray) {
        if (str.toLowerCase().includes(substr)) return true;
    }
    return false;
}

function twitterParse(newTweetsStream, topTweetsStream, unreadTweets, unreadTweetsToShow, semanticAnalysisTwitter, res) {
    newTweetsStream.destroy();
    topTweetsStream.destroy();

    let numberOfLikes = 0;
    let numberOfRetweets = 0;

    unreadTweets.forEach(tweet => {
        const senRes = sentiment.analyze((tweet.text || '').replace('#', ''));
        semanticAnalysisTwitter.samples += 1;
        semanticAnalysisTwitter.scoreSum += (senRes.score + 5) * 10;

        numberOfLikes += tweet.favoriteCount;
        numberOfRetweets += tweet.retweetCount;
    });

    let averageLikes = Math.round(numberOfLikes / unreadTweets.length * 100) / 100;
    let averageRetweets = Math.round(numberOfRetweets / unreadTweets.length * 100) / 100;

    let semScore = semanticAnalysisTwitter.scoreSum/ semanticAnalysisTwitter.samples;
    if (semScore > 100) semScore = 100;
    if (semScore < 0) semScore = 0;
    try {
        res.status(200).send({
            'success': true,
            'averageLikes': averageLikes,
            'averageRetweets': averageRetweets,
            'semanticScore': semScore,
            'tweets': cleanText(unreadTweetsToShow.sort(() => .5 - Math.random()).slice(0,9) || [])
        })
    } catch(ex) {
        //Pass
    }
}

function cleanText(strObj) {
    strObj.forEach(tweet => tweet.text = filter.clean(tweet.text));
    return strObj;
}

app.listen(port);