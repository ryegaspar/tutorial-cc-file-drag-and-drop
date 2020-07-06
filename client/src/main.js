import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'

Vue.config.productionTip = false

window.eventHub = new Vue()

new Vue({
  render: h => h(App),
}).$mount('#app')
