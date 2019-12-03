<template>
	<div class="ur-main-container container">
		
			User Center
	</div>
</template>
	
<script>
import { mapGetters } from 'vuex'

export default {
	components: {
	},
	computed: {
		...mapGetters({
			rate: 'global/init/getRate'
		})
	},
	data() {
		return {
		}
	},
	methods: {
	},
	mounted() {
	}
}
</script>

<style>

</style>
