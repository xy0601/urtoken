<template>
	<div>
		<div class="content" v-html="$t('aboutUrtokenHtml')"  style="color:rgba(0,0,0,0.5)">
		</div>	
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
