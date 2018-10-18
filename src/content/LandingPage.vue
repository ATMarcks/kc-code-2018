<template>
    <div>
        <div>If you see "success" below, then the app is running correctly:</div><br />
        <div>{{ successStatus }}</div>
    </div>
</template>

<script>
import http from '../shared/http'

export default {
  name: "LandingPage",
  data () {
    return {
      successStatus: ''
    }
  },
  mounted () {
    http.get('/test/').then(response => {
      this.successStatus = response.data.str
     }).catch(() => {
       this.successStatus = 'Backend is not working'
     })
  }
}
</script>

<style scoped>

</style>