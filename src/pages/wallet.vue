<template>
	<div>
		<div>
			<br>
			<div v-if="!isComfirmed" style="text-align:center">
				<br>
				
				<h1 style="color:rgba(0,0,0,0.6)">{{$t('urtokenWalletTitle')}}</h1>
				<p style="color:rgba(0,0,0,0.3)">{{$t('walletInfo')}}
				</p>
				<br>
				<el-button type="primary" icon="fa fa-plus" @click="visible.newWallet = true"> &nbsp;{{$t('newWallet')}}</el-button>
				<el-button type="default" icon="fas fa-arrow-down" @click="visible.restore = true"> &nbsp;{{$t('restoreWallet')}}</el-button>
				<br>
			</div>
			<div v-if="isComfirmed">
				<div class="columns">
					<div class="column is-narrow">
						<div class="box" style="width:360px;padding:0px">
							<div style="clear:both">
								
							</div>
							<div style="text-align:center;width:100%;padding:10px 0 50px 0">
								<h1 class="title capitalize">{{$t('wallet')}} <sup style="font-size:16px" :class="'fas fa-' + (!password?'lock':'unlock')"></sup> </h1>
								<div class="content is-small" style="padding:0 20px">
									
									<p style="text-align:left" v-html="$t('walletSubtitle')"></p>
								</div>
								<el-button-group>
									<el-button type="default" class="capitalize" size="mini" @click="toggleLock">{{!password?$t('unlockWallet'):$t('lockWallet')}}</el-button>
									<el-button type="default" class="capitalize" size="mini" @click="handleWalletClose">{{$t('closeWallet')}}</el-button>
								</el-button-group><br><br>
								<qrcode :value="accounts.defaultAddress" :options="{ size: 120 }"></qrcode><br>
								
								<a style="font-size:12px" v-clipboard:copy="accounts.defaultAddress" v-clipboard:success="onCopy">{{accounts.defaultAddress}}</a>&nbsp;
								<br><el-tooltip class="item" effect="dark" :content="$t('copyAccontAddress')" placement="top-start">
									<a alt="" class="capitalize" v-clipboard:copy="accounts.defaultAddress" v-clipboard:success="onCopy"><i class="fa fa-copy"></i></a><br><br>
								</el-tooltip>
								<div style="margin-top:10px;font-size:1px">&nbsp;</div>
								<el-button-group>
									<el-button @click="handleCreateNewAccount" type="default" class="capitalize" size="mini">{{$t('createNewAccount')}}</el-button>
									<el-button @click="handleEditCurrentAccount" type="default" class="capitalize" size="mini">{{$t('editCurrentAccount')}}</el-button>
									<el-button @click="handleDelCurrentAccount" type="default" class="capitalize" size="mini">{{$t('delCurrentAccount')}}</el-button>
								</el-button-group>
							</div>
							<ul class="left-menu">
								<li :class="'' + (accounts.defaultAddress===item? ' is-active' : '')"  v-for="item in addresses" :key="item">
									<a href="javascript:void(0)" @click="handelChangeAccount(item)">
									<i class="fas fa-credit-card"></i>&nbsp; {{accounts[item]?accounts[item].name:item}}
									</a>
									
								</li>
							</ul>
							<br><br>
						</div>
						
						
					</div>
					<div class="column" >
						<div class="level">
							<div class="level-left">
								<el-autocomplete
									popper-class="my-autocomplete"
									v-model="addTokenSel"
									:fetch-suggestions="querySearch"
									:placeholder="$t('addToken')"
									size="small"
									
									@select="handleSelect">
									<i
										class="fa fa-plus el-input__icon"
										slot="suffix"
										@click="handleIconClick">
									</i> 
									<template slot-scope="props">
										<div style="padding:6px 0 0 0">
											<div class="media" >
												<div class="media-left">
													<img v-if="accounts.defaultNetwork==='Main Net'" :src="'static/token_icon/svg/icon/' + (props.item.symbol) +'.svg'">
													<i v-if="accounts.defaultNetwork!=='Main Net'" class="fab fa-ethereum"></i>
												</div>
												<div class="media-content">
													<div class="symbol is-uppercase">{{ props.item.symbol }}</div>
												</div>
											</div>
										</div>
									</template>
								</el-autocomplete>
								<el-button v-show="false" type="default" class="capitalize" size="small" @click="addTokens"><i class="fas fa-plus"></i> &nbsp; {{$t('addToken')}}</el-button>
							</div>
							<div class="level-right">

								<el-button-group>
									<el-button v-if="false" type="default" class="capitalize" size="small" @click="visible.contract = true"><i class="fas fa-file-alt"></i> &nbsp; {{$t('contract')}}</el-button>
									<el-button type="default" class="capitalize" size="small" @click="visible.exportPrivateKey = true"><i class="fab fa-ethereum"></i> &nbsp; {{$t('exportPrivateKey')}}</el-button>
									<el-button type="default" class="capitalize" size="small" @click="visible.addCustomToken = true"><i class="fab fa-ethereum"></i> &nbsp; {{$t('addCustomToken')}}</el-button>
									<el-button type="default" class="capitalize" size="small" @click="getAllBalance" :disabled="isFetching.balance" :loading="isFetching.balance"><i class="fas fa-sync-alt"></i> &nbsp; {{$t('checkBalance')}}</el-button>
									<el-button type="default" class="capitalize" size="small" @click="getPrice" :disabled="fetching.price" :loading="fetching.price"><i class="fas fa-globe"></i> &nbsp; {{$t('updateRate')}}</el-button>
									<el-select class="wifi capitalize" size="small" @change="handleNetworkChange" icon="el-icon-edit"  width="200px" v-model="accounts.defaultNetwork" placeholder="请选择">
										<el-option
											v-for="net in network"
											:key="net.name"
											:label="net.name"
											:value="net.name">
										</el-option>
									</el-select>
								</el-button-group>
								
							</div>
						</div>
						<div >
							<br><br>
							
							<el-table :data="tokens" style="width: 100%" size="mini" v-loading="isFetching.balance">
								<el-table-column :label="$t('token')" width="150">
									<template slot-scope="scope">
										<i v-if="!fetching.token && accounts.defaultNetwork !== 'Main Net'" style="font-size:15px" class="fab fa-ethereum"></i> &nbsp;
										<span v-if="scope.row.info.type==='custom'" style="border-radius:12px;border:solid 1px #ccc;line-height:24px;display:inline-block;width:24px;height:24px;text-align:center"><i  style="font-size:15px;" class="fab fa-ethereum"></i></span>
										<img v-if="!fetching.token && accounts.defaultNetwork === 'Main Net'&&scope.row.info.type!=='custom'" :src="scope.row.icon" style="width:24px;height:24px;" align="absmiddle">&nbsp;
										<span style="text-transform:Uppercase;font-weight:bolder">{{scope.row.info.symbol}}</span>
									</template>
								</el-table-column>
								<el-table-column prop="balance" :label="$t('balance')" width="200">
									<template slot-scope="scope">
										{{scope.row.balance.toString()}}
									</template>
								</el-table-column>
								<el-table-column prop="unitPrice" :label="$t('unitPrice')" width="180">
									<template slot-scope="scope">
										{{priceInfo[scope.row.info.symbol] ? ratesInfo.active.symbol+ ' ' + (priceInfo[scope.row.info.symbol].price.times(ratesInfo.data[ratesInfo.active.value])).toFormat(3):'-'}} 
									</template>
								</el-table-column>
								<el-table-column :label="$t('change24h')" width="180">
									<template slot-scope="scope">
										<span :class="priceInfo[scope.row.info.symbol]&&priceInfo[scope.row.info.symbol].change24h>0?'has-text-primary':'has-text-danger'">{{priceInfo[scope.row.info.symbol]?priceInfo[scope.row.info.symbol].change24h + '%':'-'}} </span>
									</template>
								</el-table-column>
								<el-table-column prop="price" :label="$t('price')" width="180">
									<template slot-scope="scope">
										{{priceInfo[scope.row.info.symbol]&&scope.row.balance>0 ? ratesInfo.active.symbol+ ' ' + (scope.row.balance.times(priceInfo[scope.row.info.symbol].price).times(ratesInfo.data[ratesInfo.active.value])).toFormat(3):'0'}}
									</template>
								</el-table-column>
								
								<el-table-column :label="$t('action')" width="180" align="right">
									<template slot-scope="scope">
										<!--<a @click="handleGetEth" v-if="accounts.defaultNetwork === 'Ropsten Testnet' && scope.row.info.symbol === 'eth'" class="capitalize" >get eth</a> <span v-show="accounts.defaultNetwork === 'Ropsten Testnet' && scope.row.info.symbol === 'eth'">| </span>-->
										<a v-show="false" href="javascript:void(0)" class="capitalize" @click="handleHistoryClickEvent(scope.row.info.symbol)">{{$t('history')}}</a> 
										<a v-show="scope.row.info.symbol!=='eth'" href="javascript:void(0)" class="capitalize" @click="handleDelClickEvent(scope.row.info.symbol)">{{$t('del')}}</a> <span v-show="scope.row.info.symbol!=='eth'">| </span>
										<a href="javascript:void(0)" class="capitalize" @click="handleReceiveClickEvent(scope.row.info.symbol)">{{$t('receive')}}</a> | 
										<a href="javascript:void(0)" class="capitalize" @click="handleSendClickEvent(scope.row.info.symbol)">{{$t('send')}}</a>
									</template>
								</el-table-column>
							</el-table>
						</div>
					</div>
				</div>
			</div>
			<!-- New Wallet  -->
			<el-dialog :title="$t('newWallet')" :visible.sync="visible.newWallet" width="650px" @open="handleOpenCreateWalletDialog">
				<div v-loading="isFetching.genSeed">
					<div class="notification is-warning" style="padding:15px;font-size:12px;line-height:18px" v-html="$t('newWalletWarningDesc')">
					</div>
					
					
					<p class="notification">
						<span style="font-weight:bolder">{{$t('mnemonic')}}:</span><br>
						{{seed}}
					</p>
					<el-form :model="newWalletForm" :rules="newWalletRules" ref="newWalletForm" size="mini">
						<el-form-item prop="pwd" :label="$t('password')">
							<el-input size="small" :placeholder="$t('walletPwd')" v-model="newWalletForm.pwd" suffix-icon="fa fa-lock">
							</el-input>
						</el-form-item>
					</el-form>
				</div>
				<span slot="footer" class="dialog-footer">
					<el-button @click="handleOpenCreateWalletDialog" :disabled="isFetching.genSeed" :loading="isFetching.genSeed"><i class="fas fa-sync-alt"></i> &nbsp;{{$t('refresh')}}</el-button>
					<el-button type="primary" @click="handleGenKeystore" :disabled="fetching.generateKeystore" :loading="fetching.generateKeystore">{{$t('create')}}</el-button>
				</span>
				
			</el-dialog>
			<!-- Receive Transaction  -->
			<el-dialog  :visible.sync="visible.receive" width="600px">
				<div class="capitalize" slot="title">{{$t('receive') }}&nbsp;&nbsp;<span style="text-transform:Uppercase;">{{sendTokenForm.token}}</span></div>
				<div class="has-text-centered">
					<el-form :model="sendTokenForm" :rules="sendTokenRules" ref="sendTokenForm" size="mini" label-width="120px">
						<el-tag style="font-size:12px">
							<a href="javascript:void(0)"  v-clipboard:copy="accounts.defaultAddress" v-clipboard:success="onCopy">{{accounts.defaultAddress}}</a>
						</el-tag><br><br>
						<qrcode :value="accounts.defaultAddress" :options="{ size: 280 }"></qrcode><br><br>
						<el-button size="small" class="capitalize" v-clipboard:copy="accounts.defaultAddress" v-clipboard:success="onCopy">{{$t('copyAccontAddress')}}</el-button>
					</el-form>
				</div>
				<span slot="footer" class="dialog-footer">
					<el-button @click="visible.receive=false" >{{$t('close')}}</el-button>
				</span>
			</el-dialog>
			<!-- history Transaction  -->
			<el-dialog  :visible.sync="visible.history" width="1000px">
				<div class="capitalize" slot="title">{{$t('history') }}&nbsp;&nbsp;<span style="text-transform:Uppercase;">{{activeToken}}</span></div>
				<el-table :data="getHistoryTableData(activeToken)" style="width: 100%" size="mini">
					
					<el-table-column prop="idx" :label="$t('transaction')">
						<template slot-scope="scope">
							<a :href="'https://ropsten.etherscan.io/tx/' + scope.row.idx" target="_blank">{{scope.row.idx}}</a>
						</template>
					</el-table-column>
					<el-table-column prop="amount" :label="$t('amount')" width="180"></el-table-column>
					<el-table-column prop="date" :label="$t('date')" width="180">
						<template slot-scope="scope">
							{{scope.row.date | dfb}}
						</template>
					</el-table-column>
					
				</el-table>
				<span slot="footer" class="dialog-footer">
					<el-button @click="visible.history=false" >{{$t('close')}}</el-button>
				</span>
			</el-dialog>
			<!-- Send Transaction  -->
			<el-dialog  :visible.sync="visible.send" width="600px" @open="handleOpenSendDialog" @close="handleSendDialogClosed">
				<div class="capitalize" slot="title">{{$t('send') }}&nbsp;&nbsp;<span style="text-transform:Uppercase;">{{sendTokenForm.token}}</span></div>
				<el-form :model="sendTokenForm" :rules="sendTokenRules" ref="sendTokenForm" size="mini" label-width="120px">
					<el-form-item prop="from" class="ur-cap" :label="$t('sendFrom') + ':'">
						<el-tag>{{sendTokenForm.from}}</el-tag>
					</el-form-item>
					<el-form-item prop="to" class="ur-cap" :label="$t('sendTo') + ':'">
						<el-input size="small" :placeholder="($t('recipientAddress'))" v-model="sendTokenForm.to">
						</el-input>
					</el-form-item>
					<el-form-item prop="amount" class="ur-cap" :label="$t('amount') + ':'">
						<el-input size="small" :placeholder="$t('amount')" v-model.number="sendTokenForm.amount">
							
						</el-input>
					</el-form-item>
					<el-form-item prop="gas" class="ur-cap"   :label="$t('gas') + '(Gwei):'">
						<el-slider style="margin-left:6px" input-size="mini" v-model.number="sendTokenForm.gas" show-input :min="0.5" :max="10000000" :step="0.1"></el-slider>
					</el-form-item>
					<el-form-item prop="memo" class="ur-cap"  :label="$t('memo') + ':'">
						<el-input size="small" type="textarea" :placeholder="$t('memo')" v-model="sendTokenForm.memo">
							
						</el-input>
					</el-form-item>
					
				</el-form>
				
				<span slot="footer" class="dialog-footer">
					<el-button @click="visible.send=false" >{{$t('cancel')}}</el-button>
					<el-button type="primary" @click="handleSendToken" :disabled="fetching.send" :loading="fetching.send">{{$t('send')}}</el-button>
				</span>
				
			</el-dialog>

			<!-- Export Pkey Need Password  -->
			<el-dialog  :visible.sync="visible.exportPrivateKey" width="500px" @open="passwordForm.pwd = '';visible.showPk=false">
				<span slot="title" class="is-capitalized">{{$t('exportPrivateKey')}}</span>
				<el-form :model="passwordForm" :rules="passwordRules" ref="passwordForm">
					
					<el-form-item prop="pwd">
						<el-button type="success" v-show="visible.showPk" plain size="small" class="capitalize" v-clipboard:copy="privateKey" v-clipboard:success="onCopy">{{privateKey}}</el-button>
						<el-input size="small" v-show="!visible.showPk" type="password" :placeholder="$t('password')" v-model="passwordForm.pwd">
							<template slot="prepend"><i class="fa fa-lock"></i></template>
						</el-input>
					</el-form-item>
					
				</el-form>
				<span slot="footer" class="dialog-footer">
					<el-button @click="visible.exportPrivateKey = false" >{{$t('cancel')}}</el-button>
					<el-button type="primary" @click="getPrivateKey(passwordForm.pwd)" :disabled="fetching.exportPrivateKey" :loading="fetching.exportPrivateKey">{{$t('confirm')}}</el-button>
				</span>
			</el-dialog>

			<!-- Create New Account Need Password  -->
			<el-dialog  :visible.sync="visible.createNewAccount" width="500px" @open="passwordForm.pwd = ''">
				<span slot="title" class="is-capitalized">{{$t('createNewAccount')}}</span>
				<el-form :model="passwordForm" :rules="passwordRules" ref="passwordForm">
					
					<el-form-item prop="pwd">
						<el-input size="small" type="password" :placeholder="$t('password')" v-model="passwordForm.pwd">
							<template slot="prepend"><i class="fa fa-lock"></i></template>
						</el-input>
					</el-form-item>
					
				</el-form>
				<span slot="footer" class="dialog-footer">
					<el-button @click="visible.createNewAccount = false" >{{$t('cancel')}}</el-button>
					<el-button type="primary" @click="createNewAccountSub(passwordForm.pwd)" :disabled="fetching.createNewAccount" :loading="fetching.createNewAccount">{{$t('confirm')}}</el-button>
				</span>
			</el-dialog>

			<!-- Send Token Need Password  -->
			<el-dialog :title="$t('sendTokenPwd')" :visible.sync="visible.sendTokenPwd" width="500px" @open="passwordForm.pwd = ''">
				<el-form :model="passwordForm" :rules="passwordRules" ref="restoreForm">
					
					<el-form-item prop="pwd">
						<el-input size="small" type="password" :placeholder="$t('password')" v-model="passwordForm.pwd">
							<template slot="prepend"><i class="fa fa-lock"></i></template>
						</el-input>
					</el-form-item>
					
				</el-form>
				<span slot="footer" class="dialog-footer">
					<el-button @click="visible.sendTokenPwd = false" >{{$t('cancel')}}</el-button>
					<el-button type="primary" @click="HandleValidSendPassword" :disabled="fetching.validPwd" :loading="fetching.validPwd">{{$t('confirm')}}</el-button>
				</span>
			</el-dialog>

			<!-- Add Custom Token  -->
			<el-dialog :title="$t('addCustomToken')" :visible.sync="visible.addCustomToken" width="600px" @open="handleAddCustomTokenOpen">
				<el-form :model="addCustomTokenForm" :rules="addCustomTokenRules" ref="addCustomTokenForm"  label-width="150px">
					
					<el-form-item prop="symbol" :label="$t('symbol')">
						<el-input size="small" :placeholder="$t('symbol')" v-model="addCustomTokenForm.symbol"></el-input>
					</el-form-item>
					<el-form-item prop="name" :label="$t('name')">
						<el-input size="small" :placeholder="$t('name')" v-model="addCustomTokenForm.name"></el-input>
					</el-form-item>
					<el-form-item prop="contractAddress" :label="$t('contractAddress')">
						<el-input size="small" :placeholder="$t('contractAddress')" v-model="addCustomTokenForm.contractAddress"></el-input>
					</el-form-item>
					<el-form-item prop="decimals" :label="$t('decimals')">
						<el-input size="small" :placeholder="$t('decimals')" v-model="addCustomTokenForm.decimals"></el-input>
					</el-form-item>
				</el-form>
				<span slot="footer" class="dialog-footer">
					<el-button @click="visible.addCustomToken = false" >{{$t('cancel')}}</el-button>
					<el-button type="primary" @click="HandleAddCustomToken" :disabled="fetching.addCustomToken" :loading="fetching.addCustomToken">{{$t('confirm')}}</el-button>
				</span>
			</el-dialog>

			<!-- private key -->
			<el-dialog :title="$t('privateKey')" :visible.sync="visible.contract" width="800px" @open="getPrivateKey">
				<el-tag>
					{{privateKey}}
				</el-tag>
				<span slot="footer" class="dialog-footer">
					<el-button @click="visible.contract = false" >{{$t('cancel')}}</el-button>
					<el-button type="primary" @click="HandleContractSub" :disabled="fetching.contract" :loading="fetching.contract">{{$t('confirm')}}</el-button>
				</span>
			</el-dialog>

			<!-- contract -->
			<el-dialog :title="$t('contract')" :visible.sync="visible.contract" width="1200px" @open="contractForm.bytecode === ''">
				<el-form :model="contractForm" :rules="contractRules" ref="restoreForm">
					
					<el-form-item prop="code">
						<el-input size="small" type="textarea" :rows="50" placeholder="bytecode" v-model="contractForm.bytecode">
						</el-input>
					</el-form-item>
				</el-form>
				<span slot="footer" class="dialog-footer">
					<el-button @click="visible.contract = false" >{{$t('cancel')}}</el-button>
					<el-button type="primary" @click="HandleContractSub" :disabled="fetching.contract" :loading="fetching.contract">{{$t('confirm')}}</el-button>
				</span>
			</el-dialog>

			<!-- Restore Wallet  -->
			<el-dialog :visible.sync="visible.restore" width="680px" @close="handleColseRestoreDialog">
				<span slot="title" class="is-capitalized">{{$t('restore')}}</span>
				<div style="height:300px">
					<el-tabs v-model="restoreActive" type="card">
						<el-tab-pane :label="$t('mnemonic')" name="mnemonic">
							
							<el-form :model="restoreForm" :rules="restoreRules" ref="restoreForm" size="small" style="padding:20px 10px">
								<p>{{$t('restoreHDStringDesc')}}</p><br>
								<input style="display:none">
								<div class="notification capitalize is-size-7" v-html="$t('mnemonicDesc')"></div>
								<el-form-item prop="seed">
									<el-input auto-complete="off" :placeholder="($t('enterMnemonic'))" v-model="restoreForm.seed" suffix-icon="el-icon-tickets">
										
									</el-input>
								</el-form-item>
								<el-form-item prop="pwd">
									<el-input auto-complete="off" type="password" :placeholder="$t('password')" v-model="restoreForm.pwd"  suffix-icon="fa fa-lock">
									</el-input>
								</el-form-item>
							</el-form>
						</el-tab-pane>
						<el-tab-pane v-if="false" :label="$t('keystore')" name="keystore">
							<el-form v-if="false" :model="restoreKsForm" :rules="restoreKsRules" ref="restoreKsForm" size="small" style="padding:20px 10px">
								<div class="notification capitalize is-size-7" v-html="$t('keystoreDesc')"></div>
								<el-form-item prop="keystore">
									<el-input type="textarea" auto-complete="off" :placeholder="($t('keystore'))"  v-model="restoreKsForm.keystore"></el-input>
								</el-form-item>
								<el-form-item prop="pwd">
									<el-input type="password" auto-complete="off" :placeholder="$t('password')" v-model="restoreKsForm.pwd" suffix-icon="fa fa-lock">
									</el-input>
								</el-form-item>
							</el-form>
						</el-tab-pane>
						<el-tab-pane v-if="false" :label="$t('privateKey')" name="privateKey">
							<div class="notification capitalize is-size-7" v-html="$t('privateKeyDesc')"></div>
							<el-form v-if="false" :model="restorePrivateKeyForm" :rules="restorePrivateKeyRules" ref="restorePrivateKeyForm" size="small" style="padding:20px 10px">
								<el-form-item prop="privateKey">
									<el-input auto-complete="off" :placeholder="($t('privateKey'))"  v-model="restorePrivateKeyForm.privateKey"  suffix-icon="fa fa-key"></el-input>
								</el-form-item>
							</el-form>
						</el-tab-pane>
					</el-tabs>
				</div>
				<span slot="footer" class="dialog-footer">
					<el-button type="primary" @click="handleRestore" :disabled="isFetching.genKeystore" :loading="isFetching.genKeystore">{{$t('restore')}}</el-button>
				</span>
				
			</el-dialog>
		</div>
	</div>
</template>
	
<script>
import { mapGetters } from 'vuex'
import Peity from 'vue-peity'
import VueQrcode from '@xkeshi/vue-qrcode'
import Web3 from 'web3';
import { maxGasForEthSend,maxGasForTokenSend, Gwei, Ether } from '@/utils/constants'
import BigNumber from 'bignumber.js';

export default {
	components: {
		qrcode: VueQrcode
	},
	computed: {
		...mapGetters({
			seed: 'wallet/eth/getSeed',
			keystore: 'wallet/eth/getKeystore',
			password: 'wallet/eth/getPassword',
			isFetching: 'wallet/eth/isFetching',
			addresses: 'wallet/eth/getAddresses',
			isComfirmed: 'wallet/eth/isComfirmed',
			accounts: 'wallet/eth/getAccounts',
			tokens: 'wallet/eth/getTokens',
			network: 'wallet/eth/getNetwork',
			networkInfo: 'wallet/eth/getNetworkJson',
			status: 'wallet/eth/getStatus',
			tokenInfo: 'wallet/eth/getTokenInfo',
			blockNumber: 'wallet/eth/getBlockNumber',
			error: 'wallet/eth/getError',
			tokenSel: 'wallet/eth/getTokenSel',
			priceInfo: 'wallet/eth/getPrice',
			ratesInfo: 'global/init/getRates'
		})
	},
	data() {
		var checkAmount = (rule, value, callback) => {
			
			if (value < 0) {
				callback(new Error(this.$t('validSendAmount')))
			} else {
				callback()
			}
			
		}
		var checkGas = (rule, value, callback) => {
			
			if (value <= 0.1) {
				callback(new Error(this.$t('validGas')));
			} else {
				callback()
			}
			
		}
		var isValidAddress = (rule, value, callback) => {
			if(!Web3.isAddress(value)){
				callback(new Error(this.$t('isValidAddress')));
			}else{
				callback()
			}
		}
		return {
			privateKey: '',
			rates: [
				{name: 'CNY', value: 'USDCNY'},
				{name: 'USD', value: 'USDUSD'}
			],
			activeRate: 'CNY',
			restaurants: [],
			addTokenSel: '',
			restoreActive: 'mnemonic',
			activeToken: 'symb',
			visible:{
				newWallet: false,
				send: false,
				receive: false,
				restore: false,
				createNewAccount: false,
				sendTokenPwd: false,
				tx: false,
				history: false,
				addToken: false,
				contract: false,
				addCustomToken: false,
				exportPrivateKey: false,
				showPk: false,
			},
			fetching:{
				generateWallet: false,
				generateKeystore: false,
				token: false,
				createNewAccount: false,
				validPwd: false,
				send:false,
				price:false,
				contract: false,
				addCustomToken: false,
				exportPrivateKey: false
			},
			activeAccount: '',
			passwordForm: {
				pwd: ''
			},
			passwordRules: {
				pwd: [{
					required: true,
					message: this.$t('please') + ' ' + this.$t('enter') + ' ' + this.$t('password'),
					trigger: 'change'
				}, {
					min: 8,
					message: this.$t('validPwd'),
					trigger: 'blur'
				}]
			},
			newWalletForm: {
				pwd: ''
			},
			newWalletRules: {
				pwd: [{
					required: true,
					message: this.$t('please') + ' ' + this.$t('enter') + ' ' + this.$t('password'),
					trigger: 'change'
				}, {
					min: 8,
					message: this.$t('validPwd'),
					trigger: 'blur'
				}]
			},
			restoreForm: {
				seed: '',
				pwd: '',
			},
			restoreRules: {
				seed: [{
					required: true,
					message: this.$t('please') + ' ' + this.$t('enter') + ' ' + this.$t('mnemonic'),
					trigger: 'change',
				}],
				pwd: [{
					required: true,
					message: this.$t('please') + ' ' + this.$t('enter') + ' ' + this.$t('password'),
					trigger: 'change'
				}, {
					min: 8,
					message: this.$t('validPwd'),
					trigger: 'blur',
				}]
			},
			restoreKsForm: {
				keystore: '',
				pwd: '',
			},
			restoreKsRules: {
				keystore: [{
					required: true,
					message: this.$t('please') + ' ' + this.$t('enter') + ' ' + this.$t('keystore'),
					trigger: 'change',
				}],
				pwd: [{
					required: true,
					message: this.$t('please') + ' ' + this.$t('enter') + ' ' + this.$t('password'),
					trigger: 'change'
				}, {
					min: 8,
					message: this.$t('validPwd'),
					trigger: 'blur',
				}]
			},
			restorePrivateKeyForm: {
				privateKey: '',
			},
			restorePrivateKeyRules: {
				privateKey: [{
					required: true,
					message: this.$t('please') + ' ' + this.$t('enter') + ' ' + this.$t('privateKey'),
					trigger: 'change',
				}]
			},
			addCustomTokenForm: {
				symbol: '',
				name: '',
				contractAddress: '',
				decimals: 18
			},
			addCustomTokenRules: {
				symbol: [{
					required: true,
					message: this.$t('please') + ' ' + this.$t('enter') + ' ' + this.$t('symbol'),
					trigger: 'change',
				}],
				name: [{
					required: true,
					message: this.$t('please') + ' ' + this.$t('enter') + ' ' + this.$t('name'),
					trigger: 'change',
				}],
				contractAddress: [{
					required: true,
					message: this.$t('please') + ' ' + this.$t('enter') + ' ' + this.$t('contractAddress'),
					trigger: 'change',
				}, {
					validator: isValidAddress,
					trigger: 'blur'
				}],
				decimals: [{
					required: true,
					message: this.$t('please') + ' ' + this.$t('enter') + ' ' + this.$t('decimals'),
					trigger: 'change',
				}, {
					type: 'number',
					min: 0,
					message: this.$t('isValidNumber')
				}]
			},
			contractForm: {
				bytecode: '',
			},
			contractRules: {
				bytecode: [{
					required: true,
					message: this.$t('please') + ' ' + this.$t('enter') + ' bytecode' ,
					trigger: 'change',
				}]
			},
			sendTokenForm: {
				from: '',
				amount: 0,
				token: '',
				to: '',
				memo: '',
				gas: 0.5,
				tx: '',
			},
			sendTokenRules: {
				to: [{
					required: true,
					message: this.$t('please') + ' ' + this.$t('enter') + ' ' + this.$t('recipientAddress'),
					trigger: 'change'
				}, {
					validator: isValidAddress,
					trigger: 'blur'
				}],
				amount: [{
					required: true,
					message: this.$t('please') + ' ' + this.$t('enter') + ' ' + this.$t('amount'),
					trigger: 'change'
				}, {
					type: 'number',
					min: 0,
					message: this.$t('isValidNumber')
				}, {
					validator: checkAmount,
					trigger: 'change'
				}],
				gas: [{
					required: true,
					message: this.$t('please') + ' ' + this.$t('enter') + ' ' + this.$t('gas'),
					trigger: 'change'
				}, {
					type: 'number',
					min: 0,
					message: this.$t('isValidNumber')
				}, {
					validator: checkGas,
					trigger: 'change'
				}]
			},
		}
	},
	methods: {
		getPrivateKey(password){
			this.fetching.exportPrivateKey = true
			this.$store.dispatch('wallet/eth/getPrivateKey',password).then(res => {
				this.visible.showPk = true
				this.fetching.exportPrivateKey = false
				this.privateKey = res
				console.log(res)
			}).catch(err => {
				console.log(err)
				this.fetching.exportPrivateKey = false
				this.$message({
					message: this.$t(err),
					type: 'error'
				}); 
			})
		},
		querySearch(queryString, cb) {
			var restaurants = this.restaurants;
			var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
			// 调用 callback 返回建议列表的数据
			cb(results);
		},
		createFilter(queryString) {
			return (restaurant) => {
				return (restaurant.symbol.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
			};
		},
		loadAll() {
			let arr = []
			var tokenInfo = this.tokenSel[this.accounts.defaultNetwork].info
			for(const key in tokenInfo){
				
				const obj = tokenInfo[key]
				let tokensTemp = this.accounts[this.accounts.defaultAddress][this.accounts.defaultNetwork].tokens
				const exist = tokensTemp.find((element) => (element == obj.symbol))
				if(!exist)
					arr.push(obj)
			}
			return arr
		},
		handleSelect(item) {
			this.$store.dispatch('wallet/eth/addToken',item.symbol).then(res => {
				this.restaurants = this.loadAll()
				this.$store.dispatch('wallet/eth/getAllTokensBalance').then(res => {
				}).catch(error => {
				})
				this.$message({
					message: this.$t('successAddToken'),
					type: 'success',
				}); 
			}).catch(error => {
			})
		},
		handleIconClick(ev) {
		},
		handleAddCustomTokenOpen(){
			
		},
		HandleAddCustomToken(){
			this.$refs.addCustomTokenForm.validate(valid => {
				if (valid) {
					this.fetching.addCustomToken = true
					this.$store.dispatch('wallet/eth/addCustomToken',this.addCustomTokenForm).then(res => {
						this.fetching.addCustomToken = false
						this.visible.addCustomToken = false
					}).catch(error => {
					})
				}
			})
		},
		addTokens(){
			this.visible.addToken = true
		},
		getHistoryTableData(token){
			if(this.accounts[this.accounts.defaultAddress])
				return this.accounts[this.accounts.defaultAddress].transactions.filter(item=>{return item.token===token})
		},
		toggleLock(){
			if(!this.password){
				this.$prompt(this.$t('pleaseEnterWalletPwd'), this.$t('confirm'), {
					confirmButtonText: this.$t('confirm'),
					cancelButtonText: this.$t('cancel'),
					inputPattern: /[\S]{8,}/,
					inputErrorMessage: this.$t('validPwd')
				}).then(({ value }) => {
					this.$store.dispatch('wallet/eth/keyFromPasswordPromise', {pwd:value,keystore:this.keystore}).then(pwDerivedKey => {
						const isPasswordCorrect = this.keystore.isDerivedKeyCorrect(pwDerivedKey);
						if(!isPasswordCorrect){
							this.$message({
								message: this.$t('invalidPwd'),
								type: 'error',
							}); 
						} else {
							this.$store.dispatch('wallet/eth/unLockWallet',value).then(res => {
								this.$message({
									message: this.$t('successUnlock'),
									type: 'success',
								}); 
							}).catch(error => {
							})
						}
					})
					
				}).catch(() => {
					this.$message({
						type: 'info',
						message: this.$t('cancel')
					});       
				});
				

			} else {
				this.$confirm(this.$t('confirmLock'), this.$t('confirm'), {
					confirmButtonText: this.$t('confirm'),
					cancelButtonText: this.$t('cancel'),
					type: 'warning'
				}).then(() => {
					this.$store.dispatch('wallet/eth/lockWallet').then(res => {
						this.$message({
							message: this.$t('successLock'),
							type: 'success',
						}); 
					}).catch(error => {
					})
				}).catch(() => {
					this.$message({
						type: 'info',
						message: this.$t('cancel')
					});          
				});
				
			}
		},
		onCopy(e){
			this.$message({
				message: this.$t('copyAddressSuccess'),
				type: 'success'
			});
		},
		HandleContractSub(){
			
			this.$store.dispatch('wallet/eth/contract', this.contractForm.code).then(res => {
			}).catch(error => {
			})
		},
		handleWalletClose(){
			this.$confirm(this.$t('confirmClose'), this.$t('confirm'), {
				confirmButtonText: this.$t('confirm'),
				cancelButtonText: this.$t('cancel'),
				type: 'warning'
			}).then(() => {
				this.$store.dispatch('wallet/eth/walletClose').then(res => {
				}).catch(error => {
				})
			}).catch(() => {
				this.$message({
					type: 'info',
					message: this.$t('cancel')
				});          
			});
			
		},
		handleGetEth() {
			this.$store.dispatch('wallet/eth/getEth', this.accounts.defaultAddress).then(res => {
			}).catch(error => {
			})
		},
		handleOpenSendDialog() {

		},
		handleOpenCreateWalletDialog(){
			this.$store.dispatch('wallet/eth/generateSeed').then(res => {
				this.newWalletForm.pwd = this.password
			}).catch(error => {
			})
		},
		handleColseRestoreDialog() {
			this.restoreForm.seed = ''
			this.restoreForm.pwd = ''
		},
		handleRestore(){
			if(this.restoreActive === 'mnemonic'){
				this.$refs.restoreForm.validate(valid => {
					if (valid) {
						const data = {
							seed: this.restoreForm.seed,
							password: this.restoreForm.pwd
						}
						
						this.$store.dispatch('wallet/eth/restoreWallet', data).then(res => {
							this.visible.restore = false
						}).catch(error => {
							this.$message({
								message: this.$t(error),
								type: 'error'
							});
						})
					}
				})
			}
			// keystore
			if(this.restoreActive === 'keystore'){
				this.$refs.restoreKsForm.validate(valid => {
					if (valid) {
						const data = {
							keystore: this.restoreKsForm.keystore,
							password: this.restoreKsForm.pwd
						}
						
						this.$store.dispatch('wallet/eth/restoreWalletByKs', data).then(res => {
							this.visible.restore = false
						}).catch(error => {
							this.$message({
								message: this.$t(error),
								type: 'error'
							});
						})
					}
				})
			}
			
			
		},
		handleGenKeystore(){
			this.fetching.generateKeystore = true
			const data = {
				seed: this.seed,
				password: this.newWalletForm.pwd,
			}
			this.$store.dispatch('wallet/eth/generateKeystore', data).then(res => {
				this.fetching.generateKeystore = false
				this.visible.newWallet = false
			}).catch(error => {
				this.fetching.generateKeystore = false
			})
		},
		handleChangeRate(){

		},
		handelChangeAccount(item){
			this.$store.dispatch('wallet/eth/changeAccount', item).then(res => {
			}).catch(error => {
			})
		},
		handleNetworkChange(){
			this.$store.dispatch('wallet/eth/changeNetwork').then(res => {
				this.restaurants = this.loadAll()
			}).catch(error => {
				this.$message({
					message: this.$t(error),
					type: 'error'
				});
			})
		},
		handleSendClickEvent(e){
			this.visible.send = true
			this.sendTokenForm.token = e
			this.sendTokenForm.gas = 10.0
			this.sendTokenForm.from = this.accounts.defaultAddress
			const fromAddress = this.accounts.defaultAddress;
			const amount = this.sendTokenForm.amount;
			const toAddress = this.sendTokenForm.to;
			const gasPrice = new BigNumber(this.sendTokenForm.gas).times(Gwei);
			const password = this.password
/*
			if(!this.password){
				this.visible.sendTokenPwd = true
			}else{
				this.createNewAccountSub()
			}
*/
		},
		handleHistoryClickEvent(e){
			this.visible.history = true
			this.activeToken = e
		},
		handleDelClickEvent(e){
			this.$confirm(this.$t('confirmDel') + ' ' + e.toUpperCase() + '?', this.$t('del'), {
				confirmButtonText: this.$t('confirm'),
				cancelButtonText: this.$t('cancel'),
				type: 'warning'
			}).then(() => {
				this.$store.dispatch('wallet/eth/delToken', e).then(res => {
					this.restaurants = this.loadAll()

					this.$message({
						message: this.$t('successDelToken') + ' ' + e.toUpperCase(),
						type: 'success',
					}); 
				}).catch(err => {
					this.$message({
						message: this.$t(err),
						type: 'error'
					}); 
				})  
			}).catch(() => {
				this.$message({
					type: 'info',
					message: this.$t('cancel')
				});       
			});
		},
		handleReceiveClickEvent(e){
			this.visible.receive = true
			this.sendTokenForm.token = e
		},
		handleSendDialogClosed() {
			this.sendTokenForm.gas = 10.0
			this.sendTokenForm.to = ''
			this.sendTokenForm.amount = 0
			this.sendTokenForm.tx = ''
			this.sendTokenForm.memo = ''
		},
		sendTransaction(password){
			this.fetching.validPwd = true
			this.fetching.send = true
			this.$store.dispatch('wallet/eth/keyFromPasswordPromise', {pwd:password,keystore:this.keystore}).then(pwDerivedKey => {
				const isPasswordCorrect = this.keystore.isDerivedKeyCorrect(pwDerivedKey);

				this.fetching.validPwd = false
				if(!isPasswordCorrect){
					this.$message({
						message: this.$t('invalidPwd'),
						type: 'error',
					}); 
				} else {
					this.fetching.validPwd = false
					this.visible.sendTokenPwd = false
					
					this.keystore.passwordProvider = (callback) => {
						const ksPassword = password;
						callback(null, ksPassword);
					};
					let params = { 
						from: this.accounts.defaultAddress, 
						to: this.sendTokenForm.to, 
						value: new BigNumber(this.sendTokenForm.amount).times(Ether), 
						gasPrice: new BigNumber(this.sendTokenForm.gas).times(Gwei), 
						gas: maxGasForEthSend,
						token: this.sendTokenForm.token,
					}
					if(this.sendTokenForm.token!=='eth'){
						params = {
							from: this.accounts.defaultAddress, 
							to: this.sendTokenForm.to, 
							value: '0x0', 
							gasPrice: new BigNumber(this.sendTokenForm.gas).times(Gwei), 
							gas: maxGasForTokenSend,
							amount: this.sendTokenForm.amount * (10 ** this.tokenInfo[this.sendTokenForm.token].decimals),
							contractAddress: this.tokenInfo[this.sendTokenForm.token].contractAddress
						}
					}
					this.$store.dispatch('wallet/eth/sendTransactionPromise', params).then(res => {
						this.fetching.send = false
						this.sendTokenForm.tx = res
						this.visible.tx = true
						this.visible.send = false
						this.$store.dispatch('wallet/eth/getAllTokensBalance').then(res => {
						}).catch(error => {
						})
						let sendSuccessMsg = ''
						const networkObj = this.networkInfo[this.accounts.defaultNetwork]
						if(networkObj.tx_explorer){
							sendSuccessMsg = this.$t('checkTransaction') + ':<br><a href="' + networkObj.tx_explorer + res +  '" target="_blank">' + res.substring(0,15)+'...'+res.substring(res.length-15) + '</a>'
						}else{
							sendSuccessMsg = ''
						}
						this.$notify({
							title: this.$t('send') + ' ' + this.sendTokenForm.token.toUpperCase() + ' ' +  this.$t('success'),
							duration: 0,
							type: 'success',
							dangerouslyUseHTMLString: true,
							message: sendSuccessMsg
						})
					}).catch(err => {
						
						this.fetching.send = false
						this.$message({
							message: err,
							type: 'error',
						}); 
					}) 
				}
			}).catch(err => {
				this.fetching.send = false
				this.$message({
					message: err,
					type: 'error'
				}); 
			}) 
		},
		HandleValidSendPassword() {
			this.sendTransaction(this.passwordForm.pwd)
		},
		createNewAccountSub(password) {
			this.$refs.passwordForm.validate(valid => {
				if(valid){
					this.fetching.createNewAccount = true
					this.$store.dispatch('wallet/eth/createNewAccount', password).then(res => {
						this.fetching.createNewAccount = false
						this.visible.createNewAccount = false
					
					}).catch(err => {
						this.fetching.createNewAccount = false
						this.$message({
							message: this.$t(err),
							type: 'error'
						}); 
					}) 
				}

			})
		},
		handleDelCurrentAccount() {
			this.$confirm(this.$t('delActiveAccount'), this.$t('del'), {
				confirmButtonText: this.$t('confirm'),
				cancelButtonText: this.$t('cancel'),
				type: 'warning'
			}).then(() => {
				this.$store.dispatch('wallet/eth/delAccount', {address: this.accounts.defaultAddress}).then(res => {
					
					this.$message({
						message: this.$t('delAccountSuccess'),
						type: 'success',
					}); 
				}).catch(err => {
					this.$message({
						message: this.$t(err),
						type: 'error'
					}); 
				})  
			}).catch(() => {
				this.$message({
					type: 'info',
					message: this.$t('cancel')
				});       
			});
		},
		handleEditCurrentAccount() {
			this.$prompt(this.$t('editActiveAccountName'), this.$t('edit'), {
				confirmButtonText: this.$t('confirm'),
				cancelButtonText: this.$t('cancel'),
				inputValue: this.accounts[this.accounts.defaultAddress].name,
				inputPattern: /[\S]{3,}/,
				inputErrorMessage: this.$t('inValidAccountName')
			}).then(({ value }) => {
				this.$store.dispatch('wallet/eth/editNewAccount', {name:value}).then(res => {
					this.$message({
						message: this.$t('modifyAccountSuccess'),
						type: 'success',
					}); 
				}).catch(err => {
					this.$message({
						message: this.$t(err),
						type: 'error'
					}); 
				})  
			}).catch(() => {
				this.$message({
					type: 'info',
					message: this.$t('cancel')
				});       
			});
		},
		handleCreateNewAccount() {
			if(!this.password){
				this.visible.createNewAccount = true
			}else{
				this.createNewAccountSub(this.password)
			}
			
		},
		handleSendToken() {
			if(this.password){
				this.sendTransaction(this.password)
			}else{
				this.$refs.sendTokenForm.validate(valid => {
					if (valid) {
						if(!this.password){
							this.visible.sendTokenPwd = true
						}
					}
				})
			}
			
		},
		getAllBalance() {
			const data = {
				data: this.tokens, 
				address: this.accounts.defaultAddress
			}
			this.$store.dispatch('wallet/eth/getAllTokensBalance').then(res => {
			}).catch(error => {
			})
		},
		getPrice() {
			this.fetching.price = true
			this.$store.dispatch('wallet/eth/getPrice').then(res => {
				this.fetching.price = false
			}).catch(error => {
			})
		}
	},
	watch: {
		'error.show'(curVal,oldVal){
			var tt = this.error
			if(curVal){
				this.$message({
					message: this.$t(this.error.msg),
					type: 'error',
					onClose: function(){
						tt.show = false
					}
				});
			}
		},
		'isFetching.loadNetwork'(curVal,oldVal){
			
			let loading = null
			if(curVal){
				this.$loading({
					lock: false,
					customClass: 'full-loading',
					text: this.$t('loadingNetwork') + ' ' + this.accounts.defaultNetwork + '...',
					spinner: 'el-icon-loading',
					background: 'rgba(0, 0, 0, 0.5)'
				});
			} else {
				this.$loading().close()
			}
		},
		'blockNumber'(curVal,oldVal){
			this.$message({
				message: this.$t('netWorkConnSuccess') + curVal,
				type: 'success',
			});
		},
		'status.hasLoadWallet'(curVal,oldVal){
			// this.getAllBalance()
			/*
			if(!oldVal && curVal){
				if(this.networkInfo[this.accounts.defaultNetwork].rpc){
					this.loadNetwork()
				}
				
			}
			*/
		},
		'status.hasLoadNetwork'(curVal,oldVal){
			/*this.getAllBalance()*/
		},
		'status.hasInit'(curVal,oldVal){
			// this.getAllBalance()
			/*
			if(!oldVal && curVal){
			}
			*/
		},
		'accounts.defaultAddress' (curVal,oldVal){
			//this.getAllBalance()
		},
		'accounts.defaultNetwork' (curVal,oldVal){
			//this.loadNetwork()
		}
	},
	mounted() {
		
		
	},
	created () {
		this.$store.dispatch('wallet/eth/loadWallet').then(res => {
			/*
			this.$store.dispatch('wallet/eth/loadNetwork', {account: this.accounts, network: this.networkInfo}).then(res => {
			}).catch(error => {
			})	
			*/
			this.restaurants = this.loadAll()
		}).catch(error => {
		})
	}
}
</script>

<style>
.hero-bg{
	background-image: linear-gradient(180deg, rgba(255,255,255,0) 30%, #409EFF ),linear-gradient(70deg, hsl(217, 71%, 53%) 32%,  hsl(217, 71%, 53%) );
}
.left-menu{
	margin:0px;
	padding:0px;
	border-top:solid 1px #ccc;
}
.left-menu li{
	list-style: none;
	margin:0px;
	padding:0px;
	font-size:12px;
	line-height:38px;
	border-bottom:solid 1px #ccc;
	padding: 0 30px;
}
.left-menu li.is-active{
	background:rgba(0,0,0,0.05);
}
.wifi input{
	padding-left:33px;
	border-top-left-radius: 0;
	border-bottom-left-radius: 0;
	width:180px;
}
.wifi>div{
	
    display: inline-block;
    font-style: normal;
    font-variant: normal;
    text-rendering: auto;
    line-height: 1;
}
.wifi>div::before{
	font-family: element-icons!important;
	content:"\E638";
	position: absolute;
	line-height: 2rem;
	padding-left:1em;
}

.my-autocomplete{
	width:300px;
}
</style>
