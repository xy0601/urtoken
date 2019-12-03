import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

import Vuex from 'vuex'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/bulma-0.6.2/css/bulma.css'
import './assets/fontawesome/css/fontawesome-all.min.css'
import './assets/css/main.css'
import store from '@/store'
import VueI18n from 'vue-i18n'
import messages from '@/i18n'
import moment from 'moment'
import dfa from './filters/date-format-a'
import dfb from './filters/date-format-b'
import VueClipboard from 'vue-clipboard2'

import Vue2Filters from 'vue2-filters'
//import VueCookies from 'vue-cookies'

Vue.use(Vue2Filters)
Vue.use(VueClipboard)
//Vue.use(VueCookies)
Vue.use(VueI18n)
Vue.use(ElementUI)
Vue.use(Vuex)
Vue.config.productionTip = false

function objKeySort(arys) { 
	var newkey = Object.keys(arys).sort();
	var newObj = {}; 
	for(var i = 0; i < newkey.length; i++) {
		newObj[newkey[i]] = arys[newkey[i]]; 
	}
	return newObj;
}

//console.log(JSON.stringify(objKeySort(messages.zh_CN)))

const i18n = new VueI18n({
	locale: localStorage.getItem('lang') ? JSON.parse(localStorage.getItem('lang')).val : 'en_US',
	messages
})

Vue.filter('df', function (value, formatString) {
	formatString = formatString || 'YYYY-MM-DD HH:mm:ss';
	return moment(new Date(value)).fromNow();
})

Vue.filter('dfa', (value) => dfa.format(value))
Vue.filter('dfb', (value) => dfb.format(value))

new Vue({
	i18n,
	store,
	router,
	render: h => h(App)
}).$mount('#app')
