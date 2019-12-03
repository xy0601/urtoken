import api from '@/api/client'
import request from '@/utils/request'
import BigNumber from 'bignumber.js'

const types = {
	SET_DEVICE_SUCCESS : 'SET_DEVICE_SUCCESS',
	GET_RATE_SUCCESS : 'GET_RATE_SUCCESS',
	SET_LANG_SUCCESS: 'SET_LANG_SUCCESS'
}

const state = {
	lang: localStorage.getItem('lang') ? JSON.parse(localStorage.getItem('lang')) : {name: 'English', val: 'en_US', currency: 'USD'},
	langs: [
		{name: 'English', val: 'en_US', currency: 'USD'}, 
		{name: '简体中文', val: 'zh_CN', currency: 'CNY'}, 
		{name: '日本語', val: 'ja_JP', currency: 'JPY'}, 
		{name: '한국어', val: 'ko_KR', currency: 'KRW'}
	],
	menu: [
		{name: 'wallet', path: '/'}, 
		{name: 'dapp', path: '/dapp'},
		{name: 'aboutUrtoken', path: '/about'},
		{name: 'team', path: '/team'},
	],
	pathData: {
		'/': { path: [{ name: 'wallet' }]},
		'/dapp': { path: [{ name: 'market' }] },
		'/about': { path: [{ name: 'info' }]},
		'/team': { path: [{ name: 'team' }]},
	},
	device: 'desktop',
	rates: {
		active: {name:'USD', value:'USDUSD', symbol:'$'},
		data:{}
	},
	markets: [
	] 
}

let timeOutNum = 300

const actions = {
	setDevice ({ commit }, size) {
		commit(types.SET_DEVICE_SUCCESS, size)
	},
	setLang :({ commit }, lang) => {
		commit(types.SET_LANG_SUCCESS, lang)
	},
	getRates : ({ commit }, data) => {
		return new Promise((resolve, reject) => {
			setTimeout(async() => {
				const rates = await request('http://www.apilayer.net/api/live?access_key=a266123a96f5e09cbdfa62882d9dbba5&format=1')
				commit(types.GET_RATE_SUCCESS, rates.quotes)
				resolve(rates)
			}, timeOutNum)
		})
	}
}

const mutations = {
	[types.SET_DEVICE_SUCCESS] (state, size) {
		if (size <= 600) {
			state.device = 'mobile'
		}
		if (size > 600 && size <= 900) {
			state.device = 'pad'
		}
		if (size > 900) {
			state.device = 'desktop'
		}
	},
	[types.GET_RATE_SUCCESS] (state, data) {
		let rates = {}
		for(let item in data){
			rates[item] = new BigNumber(data[item])
		}
		state.rates.data = rates
		//state.rates = data.reduce((json, value, key) => {json[key] = value;return json;});
	},
	[types.SET_LANG_SUCCESS] (state, lang) {
		state.lang = lang
		localStorage.setItem('lang', JSON.stringify(lang))
	}
}

const getters = {
	getDevice: state => state.device,
	getLang: state => state.lang,
	getLangs: state => state.langs,
	getNavBarMenu: state => state.menu,
	getUserPathData: state => state.pathData,
	getRates: state => state.rates
}

export default {
	namespaced: true,
	state,
	actions,
	mutations,
	getters
}
