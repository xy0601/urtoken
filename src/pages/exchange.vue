<template>
	<div style="padding:0px;height:100%">
		
			<div class="dropdown is-hoverable">
            <div class="dropdown-trigger">
                <button class="button" aria-haspopup="true" aria-controls="dropdown-menu4">
                <span>Hover me</span>
                <span class="icon is-small">
                    <i class="fas fa-angle-down" aria-hidden="true"></i>
                </span>
                </button>
            </div>
            <div class="dropdown-menu" id="dropdown-menu4" role="menu">
                <div class="dropdown-content">
                <div class="dropdown-item">
                    <p>You can insert <strong>any type of content</strong> within the dropdown menu.</p>
                </div>
                </div>
            </div>
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
			tokens: 'public/page/getTokens',
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
