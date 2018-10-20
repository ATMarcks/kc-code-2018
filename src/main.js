import Vue from 'vue'
import BootstrapVue from "bootstrap-vue"
import App from './App.vue'
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-vue/dist/bootstrap-vue.css"
import VueChartkick from 'vue-chartkick'
import Chart from 'chart.js'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCog, faComments } from '@fortawesome/free-solid-svg-icons'
import { faTwitterSquare, faInstagram, faTumblrSquare } from '@fortawesome/fontawesome-free-brands'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faCog)
library.add(faComments)
library.add(faTwitterSquare)
library.add(faInstagram)
library.add(faTumblrSquare)

Vue.use(VueChartkick, {adapter: Chart})
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.use(BootstrapVue)

new Vue({
  el: '#app',
  render: h => h(App)
})
