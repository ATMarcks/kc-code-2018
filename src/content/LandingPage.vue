<template>
    <div>
        <b-navbar toggleable="md" style="margin-bottom: 24px;" type="dark" variant="info">Test</b-navbar>
        <b-container>
            <b-row>
                <b-col>
                    <b-jumbotron header="Twitter" class="sm-containers">
                        <p>twitter content here</p>
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
  data () {
    return {
      twitterHashtag: ''
    }
  },
  methods: {
      getTwitterData (hashtag) {
          http.get('/gettwitterdata?hashtag=' + hashtag).then(response => {
              this.successStatus = response.data
          }).catch(() => {
              this.successStatus = 'Backend is not working'
          })
      }
  },
  mounted () {
  },
}
</script>

<style scoped>
.sm-containers {
    padding-top: 32px;
}
</style>