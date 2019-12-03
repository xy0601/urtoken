<template>
	<div>
		
		<h3 class="title is-capitalized">{{$t('comingSoon')}} ...</h3>
		<p>{{$t('aboutDapp')}}</p>	
	</div>
</template>
	
<script>
import { mapGetters } from 'vuex'

export default {
	components: {
	},
	computed: {
		...mapGetters({
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
