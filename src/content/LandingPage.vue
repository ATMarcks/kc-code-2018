<template>
    <div style="width: 100%;">
        <b-navbar toggleable="md" style="margin-bottom: 0px;" variant="dark">
            <b-navbar-brand style="color: white"><font-awesome-icon icon="comments"/>&nbsp;&nbsp;Sentiment</b-navbar-brand>
            <b-navbar-nav class="ml-auto" style="color: white;  margin-left: 0px;">
                <transition name="custom-classes-tran" enter-active-class="animated fadeInRight">
                    <a v-if="!cogToggledOn" v-on:click="setDelay()" class="white-href" href="javascript://"><font-awesome-icon icon="cog"/></a>
                </transition>
                <link href="https://cdn.jsdelivr.net/npm/animate.css@3.5.1" rel="stylesheet" type="text/css">
                <transition name="custom-classes-transition"
                            enter-active-class="animated fadeInRight"
                            leave-active-class="animated fadeOutRight">
                        <div v-if="cogToggled">
                            <b-row style="width: 100%; float: right;">
                                <b-col>
                                    <b-input-group>
                                        <span style="padding-right: 12px; padding-top: 8px;">Refresh Rate</span>
                                        <b-form-input v-model="refreshRate" type="number" min="5"/>
                                    </b-input-group>
                                </b-col>
                                <b-col style="padding-top: 8px; margin-right: -40px; border-left-style: solid;">
                                    <input type="checkbox" id="tagCheckbox" name="useAllTag" v-model="sameTagsForAllCheck" v-on:click="sameTagsCheckF($event)"/>
                                    <label for="tagCheckbox">&nbsp;&nbsp;Same tag for all</label>
                                </b-col>
                                <b-col style="margin-right: 12px;">
                                    <b-input-group>
                                        <font-awesome-icon size="2x" style="float: left; margin-right: 7px; margin-top: 2px;" :icon="{ prefix: 'fab', iconName: 'instagram' }"/>
                                        <b-form-input v-model="instagramTag" placeholder="Hashtag" type="text" />
                                    </b-input-group>
                                </b-col>
                                <b-col style="margin-right: 12px;">
                                    <b-input-group>
                                        <font-awesome-icon size="2x" style="float: left; margin-right: 7px; margin-top: 2px;" :icon="{ prefix: 'fab', iconName: 'twitter' }"/>
                                        <b-form-input v-model="twitterTag" placeholder="Hashtag" type="text" />
                                    </b-input-group>
                                </b-col>
                                <b-col  style="padding-right: 12px; border-right-style: solid;">
                                    <b-input-group>
                                        <font-awesome-icon size="2x" style="float: left; margin-right: 7px; margin-top: 2px;" :icon="{ prefix: 'fab', iconName: 'tumblr' }"/>
                                        <b-form-input v-model="tumblrTag" placeholder="Hashtag" type="text" />
                                    </b-input-group>
                                </b-col>
                                <b-col>
                                    <b-button style="width: 100%" v-on:click="setDelaySave" variant="success">Save</b-button>
                                </b-col>
                                <b-col>
                                    <b-button v-on:click="setDelayCancel" style="width: 100%" variant="danger">Cancel</b-button>
                                </b-col>
                            </b-row>
                        </div>
                    </transition>
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
                <b-jumbotron v-else style="margin-left: 15px; width: 100%;" class="sm-containers">
                    <h1>
                        <font-awesome-icon  style="margin-right: 7px; margin-top: 5px;" icon="chart-bar"/>
                        Aggregate <span style="color: darkgray; font-size: 36px;"><em>{{ '#' + Array.from(storedHashtagSet).join(', #') }}</em></span>
                    </h1>
                    <div v-if="aggregatePositiveScore !== -1">
                        <b-row>
                            <b-col cols lg="3">
                                <pie-chart  class="chart-inner" :data="[['Positive', aggregatePositiveScore], ['Negative', 100 - aggregatePositiveScore]]"></pie-chart>
                            </b-col>
                            <b-col cols lg="9">
                                <area-chart :data="multipleSeriesAggregate" ></area-chart>
                            </b-col>
                        </b-row>
                    </div>
                    <div v-else>
                        <em>Waiting for data...</em>
                    </div>
                </b-jumbotron>
            </b-row>
            <b-row style="width: 100%; margin-right: 0;">
                <b-col v-if="instagramTagInStorage" col xl="4">
                    <b-jumbotron class="sm-containers">
                        <h1>
                            <font-awesome-icon style="float: left; margin-right: 7px; margin-top: 2px;" :icon="{ prefix: 'fab', iconName: 'instagram' }"/>
                            Instagram <span style="color: darkgray; font-size: 36px;"><em>#{{ instagramTagInStorage }}</em></span>
                        </h1>
                        <hr/>
                        <div v-if="instagramLoading && instagramContent.posts.length === 0"><em>&nbsp;Fetching data...</em></div>
                        <div v-else-if="instagramContent.posts.length === 0"><em>&nbsp;No results found</em></div>
                        <div v-else>
                            <b-row>
                                <b-col>
                                    <pie-chart  class="chart-inner" :data="[['Positive', instagramContent.semanticScore], ['Negative', 100 - instagramContent.semanticScore]]"></pie-chart>
                                </b-col>
                                <b-col>
                                    <div>
                                        <h2><strong>Average Likes</strong></h2>
                                        &nbsp;&nbsp;&nbsp;<strong>{{ instagramContent.averageLikes }}</strong>
                                        <hr />
                                    </div>
                                </b-col>
                            </b-row>
                            <b-jumbotron class="inside-jumbo" v-for="instagramPost in instagramContent.posts">
                                <em>{{ ellipseText(instagramPost.text, 120) }}</em><br /><br />
                                {{ formatTime(instagramPost.time) }}
                                <span style="float: right;">[Likes: {{instagramPost.edge_liked_by}}]&nbsp;<a v-bind:href="'https://www.instagram.com/p/'+instagramPost.shortcode+'/'">[link]</a></span>
                            </b-jumbotron>
                        </div>
                    </b-jumbotron>
                </b-col>
                <b-col v-if="twitterTagInStorage" col xl="4">
                    <b-jumbotron class="sm-containers">
                        <h1>
                            <font-awesome-icon style="float: left; margin-right: 7px; margin-top: 2px;" :icon="{ prefix: 'fab', iconName: 'twitter' }"/>
                            Twitter <span style="color: darkgray; font-size: 36px;"><em>#{{ twitterTagInStorage }}</em></span>
                        </h1>
                        <hr/>
                        <div v-if="twitterLoading && twitterContent.tweets.length === 0"><em>&nbsp;Fetching Data...</em></div>
                        <div v-else-if="twitterContent.tweets.length === 0"><em>&nbsp;No results found</em></div>
                        <div v-else>
                            <b-row>
                                <b-col>
                                    <pie-chart class="chart-inner" :data="[['Positive', twitterContent.semanticScore], ['Negative', 100 - twitterContent.semanticScore]]"></pie-chart>
                                </b-col>
                                <b-col>
                                    <div>
                                        <h2><strong>Average Likes</strong></h2>
                                        &nbsp;&nbsp;&nbsp;<strong>{{ twitterContent.averageLikes }}</strong>
                                        <hr />
                                        <h2><strong>Average Retweets</strong></h2>
                                        &nbsp;&nbsp;&nbsp;<strong>{{ twitterContent.averageRetweets }}</strong>
                                        <hr />
                                    </div>
                                </b-col>
                            </b-row>
                            <b-jumbotron class="inside-jumbo" v-for="twitterPost in twitterContent.tweets">
                                <em>{{ ellipseText(twitterPost.text, 120) }}</em><br /><br />
                                {{ formatTime(twitterPost.time) }}
                                <span style="float: right;">[Retweets: {{twitterPost.retweetCount}}, Likes: {{twitterPost.favoriteCount}}]&nbsp;<a v-bind:href="'https://twitter.com/'+ twitterPost.screenName+'/status/'+twitterPost.id">[link]</a></span>
                            </b-jumbotron>
                        </div>
                    </b-jumbotron>
                </b-col>
                <b-col v-if="tumblrTagInStorage" col xl="4">
                    <b-jumbotron class="sm-containers" v-for="">
                        <h1>
                            <font-awesome-icon style="float: left; margin-right: 7px; margin-top: 2px;" :icon="{ prefix: 'fab', iconName: 'tumblr' }"/>
                            Tumblr  <span style="color: darkgray; font-size: 36px;"><em>#{{ tumblrTagInStorage }}</em></span></h1>
                        <hr/>
                        <div v-if="tumblrLoading && tumblrContent.blogs.length === 0"><em>&nbsp;Fetching Data...</em></div>
                        <div v-else-if="tumblrContent.blogs.length === 0"><em>&nbsp;No results found</em></div>
                        <div v-else>
                            <b-row>
                                <b-col>
                                    <pie-chart  class="chart-inner" :data="[['Positive', tumblrContent.semanticScore], ['Negative', 100 - tumblrContent.semanticScore]]"></pie-chart>
                                </b-col>
                                <b-col>
                                    <div>
                                        <h2><strong>Average Notes</strong></h2>
                                        &nbsp;&nbsp;&nbsp;<strong>{{ tumblrContent.averageNotes }}</strong>
                                        <hr />
                                    </div>
                                </b-col>
                            </b-row>
                            <b-jumbotron class="inside-jumbo" v-for="tumblrPost in tumblrContent.blogs">
                                <em>{{ ellipseText(tumblrPost.text, 120) }}</em><br /><br />
                                {{ formatTime(tumblrPost.time) }}
                                <span style="float: right;">[Notes: {{tumblrPost.note_count}}]&nbsp;<a v-bind:href="tumblrPost.short_url">[link]</a></span>
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
                cogToggledOn: false,
                twitterTag: '', // These three vars are for the views
                tumblrTag: '',
                instagramTag: '',
                refreshRate: 20,
                twitterTagInStorage: '', // These three reflect the tags in storage
                tumblrTagInStorage: '',
                instagramTagInStorage: '',
                storedHashtagSet: new Set(),
                refreshRateInStorage: 20,
                sameTagsForAllCheck: false,
                instagramError: false,
                twitterError: false,
                tumblrError: false,
                instagramLoading: false,
                twitterLoading: false,
                tumblrLoading: false,
                twitterContent: { 'tweets': [] },
                tumblrContent: { 'blogs': [] },
                instagramContent: { 'posts': [] },
                aggregatePositiveScore: -1,
                multipleSeriesAggregate: [
                    {name: 'Workout', data: {'2017-01-01': 3, '2017-01-02': 4}},
                    {name: 'Call parents', data: {'2017-01-01': 5, '2017-01-02': 3}}
                ],
                refresher: undefined
            }
        },
        methods: {
            saveHashtags() {
                // This also saves refresh rate
                this.cogToggled = false
                this.twitterTagInStorage = this.twitterTag
                this.instagramTagInStorage = this.instagramTag
                this.tumblrTagInStorage = this.tumblrTag

                localStorage.setItem('twitterTag', this.twitterTag)
                localStorage.setItem('tumblrTag', this.tumblrTag)
                localStorage.setItem('instagramTag', this.instagramTag)

                this.storedHashtagSet = new Set()
                this.storedHashtagSet.add(this.twitterTagInStorage)
                this.storedHashtagSet.add(this.tumblrTagInStorage)
                this.storedHashtagSet.add(this.instagramTagInStorage)

                if (isNaN(this.refreshRate)) {
                    this.refreshRate = 20
                } else if (this.refreshRate < 5) {
                    this.refreshRate = 5
                }

                if (!this.twitterTagInStorage) this.twitterContent = { 'tweets': [] }
                if (!this.instagramTagInStorage) this.instagramContent = { 'blogs': [] }
                if (!this.tumblrTagInStorage) this.tumblrContent = { 'posts': [] }

                this.refreshRateInStorage = this.refreshRate
                localStorage.setItem('refreshRate', this.refreshRate.toString())

                clearInterval(this.refresher)
                this.refresher = setInterval(function () {
                    this.updateData()
                }.bind(this), this.refreshRateInStorage * 1000)

                this.updateData()
            },
            setDelay() {
                this.cogToggledOn = true;
                setTimeout(this.settingsOpened, 100);

            },
            setDelayCancel() {
                this.settingsCancelled()
                setTimeout(this.setCogToggle, 1050)
            },
            setDelaySave() {
                this.saveHashtags()
                setTimeout(this.setCogToggle, 1050)
            },
            setCogToggle() {
                this.cogToggledOn = false
            },
            settingsOpened() {
                this.cogToggled = true;
                this.twitterTag = localStorage.getItem('twitterTag') || ''
                this.tumblrTag = localStorage.getItem('tumblrTag') || ''
                this.instagramTag = localStorage.getItem('instagramTag') || ''
                this.refreshRate = parseInt(localStorage.getItem('refreshRate')) || 20
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
                    this.updateAggregate()
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
                    this.updateAggregate()
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
                    this.updateAggregate()
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
            updateAggregate() {
                let semanticTotal = 0
                let semanticCount = 0

                if ('semanticScore' in this.instagramContent) {
                    semanticCount++
                    semanticTotal += this.instagramContent.semanticScore
                }

                if ('semanticScore' in this.tumblrContent) {
                    semanticCount++
                    semanticTotal += this.tumblrContent.semanticScore
                }

                if ('semanticScore' in this.twitterContent) {
                    semanticCount++
                    semanticTotal += this.twitterContent.semanticScore
                }

                if (semanticCount > 0) {
                    this.aggregatePositiveScore = semanticTotal / semanticCount
                    console.log(this.aggregatePositiveScore)
                } else {
                    this.aggregatePositiveScore = -1
                }
            },
            formatTime(utcepoch) {
              return moment.unix(utcepoch).format('MMMM Do, h:mm A')
            },
            sameTagsCheckF(event) {
                if (event.target.checked) this.twitterTag = this.tumblrTag = this.instagramTag = ''
            },
            updateData() {
                // TODO: return a promise from each of these
                // TODO: on resolution of all, add to array
                const currentTime = moment().utc().format('YYYY-MM-DD hh:mm:ss UTC');
                if (this.tumblrTagInStorage) { this.getTumblrData(this.tumblrTagInStorage) }
                if (this.twitterTagInStorage) { this.getTwitterData(this.twitterTagInStorage) }
                if (this.instagramTagInStorage) { this.getInstagramData(this.instagramTagInStorage) }
            }
        },
        mounted: function () {
            this.twitterTagInStorage = localStorage.getItem('twitterTag') || ''
            this.tumblrTagInStorage = localStorage.getItem('tumblrTag') || ''
            this.instagramTagInStorage = localStorage.getItem('instagramTag') || ''
            this.refreshRateInStorage = parseInt(localStorage.getItem('refreshRate')) || 20

            this.storedHashtagSet = new Set()
            this.storedHashtagSet.add(this.twitterTagInStorage)
            this.storedHashtagSet.add(this.tumblrTagInStorage)
            this.storedHashtagSet.add(this.instagramTagInStorage)

            this.updateData()
            this.refresher = setInterval(function () {
                this.updateData()
            }.bind(this), this.refreshRateInStorage * 1000)
        },
        watch: {
            twitterTag: function (newTag) {
                if (this.sameTagsForAllCheck) this.tumblrTag = this.instagramTag = newTag;
            },
            tumblrTag: function (newTag) {
                if (this.sameTagsForAllCheck) this.twitterTag = this.instagramTag = newTag;
            },
            instagramTag: function (newTag) {
                if (this.sameTagsForAllCheck) this.twitterTag = this.tumblrTag = newTag;
            }
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
        overflow:hidden;
    }

    .chart-inner {
        margin-bottom: 15px;
    }

    h1 {
        font-size: 60px;
    }
</style>