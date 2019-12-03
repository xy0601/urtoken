import Vue from 'vue'
import Router from 'vue-router'
import Wallet from '@/pages/wallet'
import Dapp from '@/pages/dapp'
import About from '@/pages/about'
import Team from '@/pages/team'
import Contact from '@/pages/contact'
import Privacy from '@/pages/privacy'
import UserCenter from '@/pages/user/center'
import api from '@/api/client'

Vue.use(Router)

export default new Router({
	hashbang: false,
	mode: 'history',
	scrollBehavior (to, from, savedPosition) {
		return { x: 0, y: 0 }
	},
	routes: [
		{ path: '/', name: 'wallet', component: Wallet },
		{
			path: '/active',
			beforeEnter(to, from, next) {
				console.log(to.query.code)
			}
		},
		{ path: '/about', name: 'about', component: About },
		{ path: '/dapp', name: 'dapp', component: Dapp },
		{ path: '/team', name: 'team', component: Team },
		{ path: '/contact', name: 'contact', component: Contact },
		{ path: '/privacy', name: 'privacy', component: Privacy },
	]
})

