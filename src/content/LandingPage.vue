<template>
    <div>
        <b-navbar toggleable="md" style="margin-bottom: 24px;" type="dark" variant="info">Test</b-navbar>
        <b-container>
            <b-row>
                <b-col>
                    <b-jumbotron header="Twitter" class="sm-containers">
                        <p>twitter content here</p>
                    </b-jumbotron>
                    <b-button v-bind:onclick="getTwitterData"></b-button>
                        <b-jumbotron v-for="tweet in tweets" header="tweet" class="sm-containers">
                            <p>{{ tweet.text }}</p>
                        </b-jumbotron>
                </b-col>
                <b-col>
                    <b-jumbotron header="Facebook" class="sm-containers">
                        <p>twitter content here</p>
                    </b-jumbotron>
                </b-col>
                <b-col>
                    <b-jumbotron header="Whatever is easy" class="sm-containers">
                        <p>twitter content here</p>
                    </b-jumbotron>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
    import http from '../shared/http'

    export default {
        name: "LandingPage",
        data() {
            return {
                twitterHashtag: '',
                tumblrTag: '',
                tweets: ['',''],
                blogs: []
            }
        },
        methods: {
            getTwitterData() {
                http.get('/gettwitterdata?hashtag=' + 'cancer').then(response => {
                    this.tweets = response.data.tweets;
                    this.tweets.forEach(tweet => {
                        console.log(tweet.text);
                    })
                }).catch(() => {
                    console.log('Failed To Retrieve Tweets');
                    this.tweets = [];
                })
            },
            getTumblerData(tag) {
                http.get('/gettumblrdata?tag=' + tag).then(response => {

                }).catch(() => {
                    this.successStatus = 'Backend is not working'
                })

            }
        },
        mounted() {
        },
    }
</script>

<style scoped>
    .sm-containers {
        padding-top: 32px;
    }
</style>