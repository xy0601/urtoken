<template>
	<div>
        <section class="hero is-dark bsa">
            <div style="padding:20px">
                <div class="container">
                    <div class="columns is-vcenterd">
                        <div class="column">
                            <div class="urtoken-link">
                                ETH Light HD Wallet - Ethereum & ERC20
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <footer class="footer">
			
			<div class="container">
				<div class="columns">
					<div class="column">
						<nav class="breadcrumb has-bullet-separator" aria-label="breadcrumbs" style="margin-bottom:0px;text-transform:capitalize;">
						<ul>
							<li><router-link to="about">{{$t('about')}}</router-link></li>
							<li><router-link to="team">{{$t('team')}}</router-link></li>
							<li><router-link to="privacy">{{$t('privacy')}}</router-link></li>
							<li><router-link to="contact">{{$t('contact')}}</router-link></li>
						</ul>
						</nav>
						<div style="font-size:12px">© 2018 urtoken.top All Rights Reserved</div>
					</div>
					<div class="column is-one-quarter foot-right">
						<i class="fab fa-telegram-plane fa-lg"></i> 
						<i class="fab fa-facebook-f fa-lg"></i> 
						<i class="fab fa-twitter fa-lg"></i> 
						<i class="fab fa-reddit-alien fa-lg"></i>
					</div>
				</div>
			</div>
		</footer>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
	data() {
		return {
		}
	},
	computed: {
	},
	methods:{
	},
	mounted() {
	}
}
</script>
<style>

</style>
