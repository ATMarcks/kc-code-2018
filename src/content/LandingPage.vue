<template>
    <div style="width: 100%;">
        <b-navbar toggleable="md" style="margin-bottom: 0px;" variant="dark">
            <b-navbar-brand style="color: white">Sentiment</b-navbar-brand>
            <b-navbar-nav class="ml-auto" style="color: white;">
                <a v-if="!cogToggled" v-on:click="settingsOpened()" class="white-href" href="javascript://"><font-awesome-icon icon="cog"/></a>
                <div v-if="cogToggled">
                    <b-row style="width: 100%; float: right;">
                        <b-col cols="2" style="margin-right: 12px;">
                            <b-input-group>
                                <font-awesome-icon size="2x" style="float: left; margin-right: 7px; margin-top: 2px;" :icon="{ prefix: 'fab', iconName: 'instagram' }"/>
                                <b-form-input v-model="instagramTag" placeholder="Hashtag" type="text" />
                            </b-input-group>
                        </b-col>
                        <b-col cols="2" style="margin-right: 12px;">
                            <b-input-group>
                                <font-awesome-icon size="2x" style="float: left; margin-right: 7px; margin-top: 2px;" :icon="{ prefix: 'fab', iconName: 'twitter' }"/>
                                <b-form-input v-model="twitterTag" placeholder="Hashtag" type="text" />
                            </b-input-group>
                        </b-col>
                        <b-col cols="2" style="margin-right: 12px;">
                            <b-input-group>
                                <font-awesome-icon size="2x" style="float: left; margin-right: 7px; margin-top: 2px;" :icon="{ prefix: 'fab', iconName: 'tumblr' }"/>
                                <b-form-input v-model="tumblrTag" placeholder="Hashtag" type="text" />
                            </b-input-group>
                        </b-col>
                        <b-col cols="2">
                            <b-button style="width: 100%" v-on:click="saveHashtags" variant="success">Save</b-button>
                        </b-col>
                        <b-col cols="2">
                            <b-button v-on:click="settingsCancelled" style="width: 100%" variant="danger">Cancel</b-button>
                        </b-col>
                    </b-row>
                </div>
            </b-navbar-nav>
        </b-navbar>
        <b-container style="padding: 30px;" fluid> <!-- add margins here for more space -->
            <b-row style="width: 100%; margin-right: 0;">
                <b-jumbotron v-if="!twitterTagInStorage && !tumblrTagInStorage && !instagramTagInStorage" style="margin-left: 15px; width: 100%;" class="sm-containers">
                    <h1>Welcome to Sentiment</h1>
                    <h3>Sentiment uses sentiment analysis to get the general positive and negative sentiment of a
                        certain hashtag by social media users. Click on the cog on the top right to get started.</h3>
                    <p></p>
                </b-jumbotron>
            </b-row>
            <b-row style="width: 100%; margin-right: 0;">
                <b-col v-if="instagramTagInStorage">
                    <b-jumbotron class="sm-containers">
                        <h1>Instagram <span style="color: darkgray; font-size: 36px;"><em>#{{ instagramTagInStorage }}</em></span></h1>
                        <div v-if="instagramLoading && instagramContent.tweets.length === 0"><em>&nbsp;Fetching data...</em></div>
                        <div v-else-if="instagramContent.posts.length === 0"><em>&nbsp;No results found -- Instagram tags sometimes require correct capitalization</em></div>
                        <div v-else>
                            <pie-chart  class="chart-inner" :data="[['Positive', instagramContent.semanticScore], ['Negative', 100 - instagramContent.semanticScore]]"></pie-chart>
                            <b-jumbotron class="inside-jumbo" v-for="instagramPost in instagramContent.posts">
                                <em>{{ ellipseText(instagramPost.text, 120) }}</em><br /><br />
                                {{ formatTime(instagramPost.time) }}
                            </b-jumbotron>
                        </div>
                    </b-jumbotron>
                </b-col>
                <b-col v-if="twitterTagInStorage">
                    <b-jumbotron class="sm-containers">
                        <h1>Twitter <span style="color: darkgray; font-size: 36px;"><em>#{{ twitterTagInStorage }}</em></span></h1>
                        <div v-if="twitterLoading && twitterContent.tweets.length === 0"><em>&nbsp;Fetching Data...</em></div>
                        <div v-else-if="twitterContent.tweets.length === 0"><em>&nbsp;No results found</em></div>
                        <div v-else>
                            <pie-chart class="chart-inner" style="width: 75%;" :data="[['Positive', twitterContent.semanticScore], ['Negative', 100 - twitterContent.semanticScore]]"></pie-chart>
                            <b-jumbotron class="inside-jumbo" v-for="twitterPost in twitterContent.tweets">
                                <em>{{ ellipseText(twitterPost.text, 120) }}</em><br /><br />
                                {{ formatTime(twitterPost.time) }}
                                <span style="float: right;">&nbsp;<a v-bind:href="'https://twitter.com/'+ twitterPost.screenName+'/status/'+twitterPost.id">[link]</a></span>
                            </b-jumbotron>
                        </div>
                    </b-jumbotron>
                </b-col>
                <b-col v-if="tumblrTagInStorage">
                    <b-jumbotron class="sm-containers" v-for="">
                        <h1>Tumblr  <span style="color: darkgray; font-size: 36px;"><em>#{{ tumblrTagInStorage }}</em></span></h1>
                        <div v-if="tumblrLoading && tumblrContent.tweets.length === 0"><em>&nbsp;Fetching Data...</em></div>
                        <div v-else-if="tumblrContent.blogs.length === 0"><em>&nbsp;No results found</em></div>
                        <div v-else>
                            <pie-chart  class="chart-inner" :data="[['Positive', tumblrContent.semanticScore], ['Negative', 100 - tumblrContent.semanticScore]]"></pie-chart>
                            <b-jumbotron class="inside-jumbo" v-for="tumblrPost in tumblrContent.blogs">
                                <em>{{ ellipseText(tumblrPost.text, 120) }}</em><br /><br />
                                {{ formatTime(tumblrPost.time) }}
                            </b-jumbotron>
                        </div>
                    </b-jumbotron>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
    import http from '../shared/http'
    import moment from 'moment'

    export default {
        name: "LandingPage",
        data() {
            return {
                cogToggled: false,
                twitterTag: '', // These three vars are for the views
                tumblrTag: '',
                instagramTag: '',
                twitterTagInStorage: '', // These three reflect the tags in storage
                tumblrTagInStorage: '',
                instagramTagInStorage: '',
                instagramError: false,
                twitterError: false,
                tumblrError: false,
                instagramLoading: false,
                twitterLoading: false,
                tumblrLoading: false,
                twitterContent: { 'tweets': [] },
                tumblrContent: { 'blogs': [] },
                instagramContent: { 'posts': []}
            }
        },
        methods: {
            saveHashtags() {
                this.cogToggled = false
                this.twitterTagInStorage = this.twitterTag
                this.instagramTagInStorage = this.instagramTag
                this.tumblrTagInStorage = this.tumblrTag
                localStorage.setItem('twitterTag', this.twitterTag)
                localStorage.setItem('tumblrTag', this.tumblrTag)
                localStorage.setItem('instagramTag', this.instagramTag)
                this.updateData();
            },
            settingsOpened() {
                this.cogToggled = true
                this.twitterTag = localStorage.getItem('twitterTag') || ''
                this.tumblrTag = localStorage.getItem('tumblrTag') || ''
                this.instagramTag = localStorage.getItem('instagramTag') || ''
            },
            settingsCancelled() {
                this.cogToggled = false;
                this.twitterTag = localStorage.getItem('twitterTag') || ''
                this.tumblrTag = localStorage.getItem('tumblrTag') || ''
                this.instagramTag = localStorage.getItem('instagramTag') || ''
            },
            getTwitterData(tag) {
                this.twitterLoading = true
                http.get('/gettwitterdata?hashtag=' + tag).then(response => {
                    this.twitterContent = response.data
                    this.twitterError = false
                    this.twitterLoading = false
                }).catch(() => {
                    this.twitterError = true
                    this.twitterLoading = false
                })
            },
            getTumblrData(tag) {
                this.tumblrLoading = true
                http.get('/gettumblrdata?tag=' + tag).then(response => {
                    this.tumblrContent = response.data
                    this.tumblrError = false
                    this.tumblrLoading = false
                }).catch(() => {
                    this.tumblrError = true
                    this.tumblrLoading = false
                })
            },
            getInstagramData(tag) {
                this.instagramLoading = true
                http.get('/getinstagramdata?tag=' + tag).then(response => {
                    this.instagramLoading = false
                    this.instagramContent = response.data
                    this.instagramError = false
                }).catch(() => {
                    this.instagramLoading = false
                    this.instagramError = true
                })
            },
            ellipseText(text, limit) {
                if (text.length <= limit) {
                    return text;
                } else {
                    return text.substring(0, limit -1) + '...'
                }
            },
            formatTime(utcepoch) {
              return moment.unix(utcepoch).format('MMMM Do, YYYY h:mm A')
            },
            updateData() {
                if (this.tumblrTagInStorage) { this.getTumblrData(this.tumblrTagInStorage) }
                if (this.twitterTagInStorage) { this.getTwitterData(this.twitterTagInStorage) }
                if (this.instagramTagInStorage) { this.getInstagramData(this.instagramTagInStorage) }
            }
        },
        mounted: function () {
            this.twitterTagInStorage = localStorage.getItem('twitterTag') || ''
            this.tumblrTagInStorage = localStorage.getItem('tumblrTag') || ''
            this.instagramTagInStorage = localStorage.getItem('instagramTag') || ''

            this.updateData()
            setInterval(function () {
                // Every 10 seconds
                this.updateData()
            }.bind(this), 20000);
        }
    }
</script>

<style scoped>
    .sm-containers {
        padding-top: 32px;
        padding-bottom: 32px;
    }

    a.white-href:link {
        color: #FFFFFF;
    }

    .inside-jumbo {
        background-color: lightgray;
        padding: 12px;
    }

    .chart-inner {
        margin-bottom: 15px;
    }

    h1 {
        font-size: 80px;
    }
</style>