<template>
	<div>
		<div class="content" v-html="$t('contactHtml')">
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
