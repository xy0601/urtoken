import axios from 'axios'
import config from './client_config'
import router from '../router'

axios.interceptors.request.use(config => {
	return config
}, error => {
	return Promise.reject(error)
})

axios.interceptors.response.use(response => response, error => Promise.resolve(error.response))
/*
function checkStatus (response) {
	console.log('response.status:' + response.status)
	if (response.status === 200 || response.status === 304) {
		return response
	}
	if (response.status === 401) {
		console.log('signin')
		Vue.$router.push('/signin')
	}
	return {
		data: {
			code: -404,
			msg: response.statusText,
			result: ''
		}
	}
}

function checkCode (res) {
	if (res.data.code === -500) {
		window.location.href = '/backend'
	} else if (res.data.code === -400) {
		window.location.href = '/'
	} else if (res.data.code !== 200) {
	}
	return res
}
*/

export default {
	post (url, data) {
		var headers = {
			'X-Requested-With': 'XMLHttpRequest',
			'Content-Type': 'application/json; charset=UTF-8',
			'Lang': localStorage.lang != null ? JSON.parse(localStorage.lang).val : 'en_US'
		}
		if (url.indexOf('user/') >= 0) {
			headers.Authorization = 'Bearer ' + sessionStorage.token
		}
		return axios({
			method: 'post',
			url: config.api + url,
			data: data,
			timeout: config.timeout,
			headers: headers
		})
	},
	get (url, params) {
		var headers = {
			'X-Requested-With': 'XMLHttpRequest',
			'Content-Type': 'application/json; charset=UTF-8',
			'Lang': localStorage.lang != null ? JSON.parse(localStorage.lang).val : 'en_US'
		}
		if (url.indexOf('user/') >= 0) {
			headers.Authorization = 'Bearer ' + sessionStorage.token
		}
		return axios({
			method: 'get',
			url: config.api + url,
			params,
			timeout: config.timeout,
			headers: headers
		})
	},
	getAbs (url, params) {
		var headers = {
			'X-Requested-With': 'XMLHttpRequest',
			'Content-Type': 'application/json; charset=UTF-8'
		}
		return axios({
			method: 'get',
			url: url,
			params,
			timeout: config.timeout,
			headers: headers
		})
	}
}

axios.interceptors.response.use(
	response => {
		switch (response.status) {
		case 401:
			console.log(router.currentRoute.fullPath)
			if (router.currentRoute.fullPath.indexOf('admin886/') >= 0) {
				router.replace({
					path: '/admin886/login',
					query: {redirect: router.currentRoute.fullPath}
				})
			} 
			/*
			else {
				router.replace({
					path: '/signin',
					query: {redirect: router.currentRoute.fullPath}
				})
			}
			*/
			return Promise.reject(response)
		}
		return response
	},
	error => {
		console.log(error)
		if (error.response) {
			switch (error.response.status) {
			case 401:
				console.log(401)
			}
		}
		return Promise.reject(error.response.data) // 返回接口返回的错误信息
	}
)
