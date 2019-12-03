export default {
	format (value) {
		var classTime = new Date(value)
		var nowTime = new Date()
		var totalSecs = (nowTime - classTime) / 1000
		var days = Math.floor(totalSecs / 3600 / 24)
		var hours = Math.floor((totalSecs - days * 24 * 3600) / 3600)
		var mins = Math.floor((totalSecs - days * 24 * 3600 - hours * 3600) / 60)
		if (days !== 0) {
			return '约' + days + '天前'
		} else if (hours === 0 && mins === 0) {
			return '刚刚'
		} else if (hours === 0 && mins !== 0) {
			return '约' + mins + '分钟前'
		} else if (hours !== 0) {
			return '约' + hours + '小时前'
		}
		return value
	}
}
