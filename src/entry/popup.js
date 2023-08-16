import Vue from 'vue'
import App from '../view/popup.vue'
import "../css/tailwindcss.css"

Vue.config.productionTip = false

new Vue({
  render: (h) => h(App)
}).$mount('#app')