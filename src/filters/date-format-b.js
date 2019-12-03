export default {
	format (value) {
		var formatD = new Date(value)
		var fmt = 'yyyy-MM-dd HH:mm:ss'
		var o = {
			'M+': formatD.getMonth() + 1,
			'd+': formatD.getDate(),
			'h+': formatD.getHours() % 12 === 0 ? 12 : formatD.getHours() % 12,
			'H+': formatD.getHours(),
			'm+': formatD.getMinutes(),
			's+': formatD.getSeconds(),
			'q+': Math.floor((formatD.getMonth() + 3) / 3),
			'S': formatD.getMilliseconds()
		}
		var week = {
			'0': '/u65e5',
			'1': '/u4e00',
			'2': '/u4e8c',
			'3': '/u4e09',
			'4': '/u56db',
			'5': '/u4e94',
			'6': '/u516d'
		}
		if (/(y+)/.test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (formatD.getFullYear() + '').substr(4 - RegExp.$1.length))
		}
		if (/(E+)/.test(fmt)) {
			fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '/u661f/u671f' : '/u5468') : '') + week[formatD.getDay() + ''])
		}
		for (var k in o) {
			if (new RegExp('(' + k + ')').test(fmt)) {
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
			}
		}
		return fmt
	}
}
