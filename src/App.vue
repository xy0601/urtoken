<template>
	<transition  name="slide-fade" mode="out-in" appear>
	<div id="app" style="height:100%">
		
		<nav-bar></nav-bar>
		<div class="ur-main-container container">
			<transition  name="slide-fade" mode="out-in" appear>
				<router-view/>
			</transition>
		</div>
		<Footer></Footer>
	</div>
	</transition>
</template>

<script>
import NavBar from '@/pages/inc/nav-bar'
import Footer from '@/pages/inc/footer'
export default {
	name: 'app',
	components: {
		NavBar,
		Footer
	},
	data() {
		return {
		}
	},
	computed: {
	},
	methods:{
	},
	mounted() {
		this.$store.dispatch('global/init/getRates').then(res => {
      console.log(res)
		}).catch(error => {
      console.log(error)
		})
	},
	created() {
		//document.getElementById('fullscreenLoader').style.display = 'none'
	}
}
</script>
