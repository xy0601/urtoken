import Vue from 'vue'
import Vuex from 'vuex'

import eth from './modules/eth'
import globalInit from './modules/global'

Vue.use(Vuex)

export default new Vuex.Store({
	modules: {
		wallet: {
			namespaced: true,
			modules: {
				eth,
			}
		},
		global: {
			namespaced: true,
			...global,
			modules: {
				init: globalInit
			}
		}
	}
})
