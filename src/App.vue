<template>
  <landing-page class="app"></landing-page>
</template>

<script>
import LandingPage from './content/LandingPage.vue'
import Vue from 'vue'

export default {
  name: 'app',
  components: { LandingPage }
}
</script>

<style>
.app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}
</style>
