<template>
	<div id="app" style="height:100%">
		<nav class="navbar is-dark">
            <div class="navbar-brand" style="margin-right:100px">
				<img src="/static/img/ut_logo_grey.svg" align="absmiddle" style="height:36px;width:36px;margin:10px 0 10px 20px"> 
                <router-link  class="navbar-item" to="/">
                    <div style="color:margin:0px;padding:0 0px;font-weight:normal;font-size:26px;">URTOKEN <sup style="font-size:12px">.top</sup></div>
                </router-link>
            </div>
            <div class="navbar-menu">
                <div class="navbar-start">
                    <router-link :to="menu.path" :class="'navbar-item is-hoverable ' + (menu.sub?'has-dropdown':'') + (menu.path === $route.path?'is-active':'' )"  v-for="menu in menus" :key="menu.path">
                        <span v-if="!menu.sub">{{ $t(menu.name) }}</span>
                        <a class="navbar-link"  v-if="menu.sub">{{ $t(menu.name) }}</a>
                        <div class="navbar-dropdown" v-if="menu.sub">
                            <router-link v-for="sub in menu.sub" class="navbar-item" :to="sub.path" :key="sub.path">{{ $t(sub.name) }}</router-link>
                        </div>
                    </router-link >

                    
                </div>
                <div class="navbar-end">
                    <div class="navbar-item has-dropdown is-hoverable">
                        <a  style="text-transform: none;font-size:14px" class="navbar-link">{{ratesInfo.active.name}}</a>
                        <div class="navbar-dropdown" style="width:172px;padding:8px 0px 8px 0px">
                            
                            <div class="tags" style="padding-left:8px">
                            <a  style="width:46px" :class="ratesInfo.active.value ===rate.value?'tag is-info':'tag'" href="javascript:void(0)" @click="setRate(rate)" v-for="rate in rates" :key="rate.value">{{rate.name}} </a>
                            </div>
                            <hr class="navbar-divider">
                            <a class="navbar-item">
                                1USD = {{ratesInfo.data[ratesInfo.active.value]?ratesInfo.data[ratesInfo.active.value].toFormat(3):''}} {{ratesInfo.active.symbol}}
                                
                            </a>
                        </div>
                    </div>
                    
                    <div class="navbar-item has-dropdown is-hoverable">
                        <a  style="text-transform: none;font-size:14px" class="navbar-link">{{lang.name}}</a>
                        <div class="navbar-dropdown is-right">
                            <a v-for="language in langs" class="dropdown-item" :class="language.name===lang.name?'is-active':''" href="javascript:void(0)" @click="setLang(language)" :key="language.val"><span>{{language.name}}</span></a>
                        </div>
                    </div>
                </div> 
            </div>
		</nav>
        <div style="background:#242424;height:38px">
			&nbsp;
		</div>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
	name: 'nav-bar',
	data() {

		return {
			rates: [
				{name: 'CNY', value: 'USDCNY',symbol: '¥'},
				{name: 'USD', value: 'USDUSD', symbol: '$'},
				{name: 'JPY', value: 'USDJPY', symbol: 'JPY'},
				{name: 'KRW', value: 'USDKRW', symbol: '₩'}
			],
		}
	},
	computed: {
		...mapGetters({
			ratesInfo: 'global/init/getRates',
			lang: 'global/init/getLang',
			langs: 'global/init/getLangs',
			menus: 'global/init/getNavBarMenu',
		})
	},
	methods:{
		setLang (lang) {
			this.$store.dispatch('global/init/setLang',lang).then(res => {
				this.$i18n.locale = lang.val
			}).catch(error => {
				console.log(error)
			})
		},
		setRate(rate){
			this.ratesInfo.active = rate
			localStorage.setItem('rate',JSON.stringify(rate))
		},
	},
	mounted() {
	},
	
}
</script>
<style>

</style>
