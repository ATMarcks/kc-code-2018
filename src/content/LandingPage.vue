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
            <b-row style="width: 100%;">
                <b-jumbotron style="margin-left: 15px; width: 100%;" class="sm-containers">
                    <h1>Welcome to Sentiment</h1>
                    <p></p>
                </b-jumbotron>
            </b-row>
            <b-row style="width: 100%;">
                <b-col>
                    <b-jumbotron header="Instagram" class="sm-containers">
                        <div v-if="instagramContent.length === 0">
                            You don't have any Instagram data - select a hashtag to follow by clicking the cog in the top right.
                        </div>
                        <div v-else>
                            <pie-chart  class="chart-inner" :data="[['Positive', instagramContent.semanticScore], ['Negative', 100 - instagramContent.semanticScore]]"></pie-chart>
                            <b-jumbotron class="inside-jumbo" v-for="instagramPost in instagramContent.posts">
                                <em>{{ ellipseText(instagramPost.text, 120) }}</em><br /><br />
                                {{ formatTime(instagramPost.time) }}
                            </b-jumbotron>
                        </div>
                    </b-jumbotron>
                </b-col>
                <b-col>
                    <b-jumbotron header="Twitter" class="sm-containers">
                        <div v-if="twitterContent.length === 0">
                            You don't have any Twitter data - you can select a hashtag to follow by clicking the cog in the top right.
                        </div>
                        <div v-else>
                            <pie-chart class="chart-inner" style="width: 75%;" :data="[['Positive', twitterContent.semanticScore], ['Negative', 100 - twitterContent.semanticScore]]"></pie-chart>
                            <b-jumbotron class="inside-jumbo" v-for="twitterPost in twitterContent.tweets">
                                <em>{{ ellipseText(twitterPost.text, 120) }}</em><br /><br />
                                {{ formatTime(twitterPost.time) }}
                            </b-jumbotron>
                        </div>
                    </b-jumbotron>
                </b-col>
                <b-col>
                    <b-jumbotron header="Tumblr" class="sm-containers" v-for="">
                        <div v-if="tumblrContent.blogs.length === 0">
                            You don't have any Tumblr data - you can select a hashtag to follow by clicking the cog in the top right.
                        </div>
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
                twitterTag: '',
                tumblrTag: '',
                instagramTag: '',
                twitterContent: [],
                tumblrContent: [],
                instagramContent: []
            }
        },
        methods: {
            saveHashtags() {
                this.cogToggled = false
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
                http.get('/gettwitterdata?hashtag=' + tag).then(response => {
                    this.twitterContent = response.data;
                }).catch(() => {
                    console.log('Failed To Retrieve Tweets');
                    this.twitterContent = [];
                })
            },
            getTumblrData(tag) {
                http.get('/gettumblrdata?tag=' + tag).then(response => {
                    this.tumblrContent = response.data;
                }).catch(() => {
                    this.successStatus = 'Backend is not working'
                })
            },
            getInstagramData(tag) {
                http.get('/getinstagramdata?tag=' + tag).then(response => {
                    this.instagramContent = response.data;
                }).catch(() => {
                    this.successStatus = 'Backend is not working'
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
                const tumblrTag = localStorage.getItem('tumblrTag')
                const twitterTag = localStorage.getItem('twitterTag')
                const instagramTag = localStorage.getItem('instagramTag')
                if (tumblrTag) { this.getTumblrData(tumblrTag) }
                if (twitterTag) { this.getTwitterData(twitterTag) }
                if (instagramTag) { this.getInstagramData(instagramTag) }
            }
        },
        mounted: function () {
            this.updateData()
            setInterval(function () {
                // Every 10 seconds
                this.updateData()
            }.bind(this), 60000);
        }
    }
</script>

<style scoped>
    .sm-containers {
        padding-top: 32px;
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