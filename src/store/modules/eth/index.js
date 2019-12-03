import * as actions from './actions'
import * as getters from './getters'
import * as types from './mutation-types'
import engine from 'store/src/store-engine'
import storages from 'store/storages/sessionStorage'
import { generatedPasswordLength, hdPathString, offlineModeString, defaultNetwork, localStorageKey, sessionStorageKey, network } from '@/utils/constants'
import TokenSelection from '@/token/list'
import localStore from 'store/dist/store.modern'
import lightwallet from 'eth-lightwallet'
import BigNumber from 'bignumber.js'


var plugins = []
const sessionStore = engine.createStore(storages, plugins)

const state = {
	seed: false,
	password: false,
	keystore: false,
	addresses: [],
	isComfirmed: false,
	network,
	activeToken: false,
	tokenInfo: false,
	accounts:{
		customToken: {},
		defaultAddress: false,
		defaultNetwork: 'Ropsten Testnet',
	},
	tokens: [],
	blockNumber: 0,
	status: {
		hasInit: false,
		hasLoadWallet: false,
		hasLoadNetwork: false,
	},
	isFetching: {
		genSeed: false,
		genKeystore: false,
		initAccounts: false,
		initAccountTokens: false,
		loadNetwork: false,
		balance: false,
		restore: false
	},
	error: {show:false,msg:false},
	tokenSel: TokenSelection,
	priceInfo: false
}

const state_new = {
	bump:{
		accounts:[
			{
				name: '',
				address: '',
				type: 'eth',
				password: false,
				keystore: false,
			}
		],
		defaultAccount: 0,
		defaultNetwork: 'Ropsten Testnet',
	}
}

const updateAddresses = () => {
	let addresses = []
	for(let key in state.accounts){
		if(key!=='defaultAddress' && key!=='defaultNetwork'){
			addresses.push(key)
		}
	}
	state.addresses = addresses
}

const addAccountsToStore = (address) => {
	state.addresses.push(address)
	let accounts = state.accounts
	accounts[address] = {
		transactions: []
	}
	accounts[address].name = 'Account ' + state.addresses.length
	for(let net in TokenSelection){
		accounts[address][net] = {tokens:[]}
		accounts[address][net].tokens = TokenSelection[net].default ? TokenSelection[net].default : []
	}
	const dump = {
		ver: '1',
		saved: new Date().toISOString(),
		ks: state.keystore.serialize(),
		accounts,
	};
	localStore.set(localStorageKey, dump);
}

const setAccountsToStore = () => {
	let accounts = state.accounts
	let num = 0
	for(let address of state.addresses){
		num ++ 
		if(!accounts[address]){
			accounts[address] = {
				transactions: state.accounts[address]?(state.accounts[address].transactions ? state.accounts[address].transactions : []):[]
			}
		}
		
		accounts[address].name = 'Account ' + num
		for(let net in TokenSelection){
			if(!state.accounts[address][net]){
				accounts[address][net] = {tokens:[]}
				accounts[address][net].tokens = TokenSelection[net].default ? TokenSelection[net].default : []
			}
			
			
		}
	}
	accounts.defaultNetwork = state.accounts.defaultNetwork	
	const dump = {
		ver: '1',
		saved: new Date().toISOString(),
		ks: state.keystore.serialize(),
		accounts: state.accounts,
	};

	localStore.set(localStorageKey, dump);
	state.accounts = accounts
}

const initAccountTokens = () => {
	state.tokenInfo = TokenSelection[state.accounts.defaultNetwork].info
	for(let key in state.accounts.customToken){
		state.tokenInfo[key] = state.accounts.customToken[key]
	}
	state.tokens = state.accounts[state.accounts.defaultAddress][state.accounts.defaultNetwork].tokens.map(item => {
		return { info: state.tokenInfo[item],balance: new BigNumber(0),change24H: 0, unitPrice: new BigNumber(0), price: new BigNumber(0), icon: 'static/token_icon/svg/icon/' + state.tokenInfo[item].symbol + '.svg' }
	})
}

const mutations = {
	[types.GEN_SEED_REQUEST] (state) {
		state.isFetching.genSeed = true
	},
	[types.GEN_SEED_SUCCESS] (state, data) {
		state.seed = data.seed
		state.password = data.password
		state.isFetching.genSeed = false
	},
	[types.GEN_KEYSTORE_REQUEST] (state, data) {
		state.isFetching.genKeystore = true
	},
	[types.GEN_KEYSTORE_SUCCESS] (state, data) {
		state.keystore = data.keystore
		state.addresses = data.addresses
		state.password = data.password
		state.isComfirmed = true
		if(!state.accounts.defaultAddress){
			state.accounts.defaultAddress = state.addresses[0]
		}
		state.isFetching.genKeystore = false
	},

	[types.INIT_ACCOUNT_REQUEST] (state) {
		state.isFetching.initAccounts = true
	},

	[types.INIT_ACCOUNT_SUCCESS] (state, data) {
		setAccountsToStore()
		state.isFetching.initAccounts = false
	},

	[types.INIT_ACCOUNT_TOKENS_REQUEST] (state) {
		state.isFetching.initAccountTokens = true
	},

	[types.INIT_ACCOUNT_TOKENS_SUCCESS] (state, data) {
		initAccountTokens()
		state.isFetching.initAccountTokens = false
	},
	[types.ACCOUNT_CHANGE_REQUEST] (state, data) {
		
	},
	[types.ACCOUNT_CHANGE_SUCCESS] (state, data) {
		
	},
	[types.NETWORK_CHANGE_REQUEST] (state) {
	},
	[types.NETWORK_CHANGE_SUCCESS] (state, data) {
		
	},
	[types.LOAD_NETWORK_REQUEST] (state) {
		state.isFetching.loadNetwork = true
	},
	[types.LOAD_NETWORK_SUCCESS] (state, data) {
		state.blockNumber = data
		state.isFetching.loadNetwork = false
		const dump = {
			ver: '1',
			saved: new Date().toISOString(),
			ks: state.keystore.serialize(),
			accounts:state.accounts,
		};
		localStore.set(localStorageKey, dump);
	},
	[types.LOAD_NETWORK_ERROR] (state, msg) {
		state.error.show = true
		state.error.msg = msg
		state.isFetching.loadNetwork = false
	},
	[types.GET_ALL_BALANCE_REQUEST] (state) {
		state.isFetching.balance = true
	},

	[types.GET_ALL_BALANCE_SUCCESS] (state, data) {
		state.isFetching.balance = false
	},
	[types.EDIT_ACCOUNT_REQUEST] (state) {
	},

	[types.EDIT_ACCOUNT_SUCCESS] (state, data) {
		state.accounts[state.accounts.defaultAddress].name = data
		const dump = {
			ver: '1',
			saved: new Date().toISOString(),
			ks: state.keystore.serialize(),
			accounts:state.accounts,
		};
		updateAddresses()
		localStore.set(localStorageKey, dump);
	},
	[types.DEL_ACCOUNT_REQUEST] (state) {
	},

	[types.DEL_ACCOUNT_SUCCESS] (state, data) {
		delete state.accounts[data]
		let n = 0
		for(let key in state.accounts){
			if(n === 0)
				state.accounts.defaultAddress = key
		}
		
		const dump = {
			ver: '1',
			saved: new Date().toISOString(),
			ks: state.keystore.serialize(),
			accounts:state.accounts,
		};
		updateAddresses()
		localStore.set(localStorageKey, dump);
	},
	[types.ADD_TOKEN_REQUEST] (state) {

	},
	[types.ADD_TOKEN_SUCCESS] (state, data) {
		state.accounts[state.accounts.defaultAddress][state.accounts.defaultNetwork].tokens.push(data)
		initAccountTokens()
		const dump = {
			ver: '1',
			saved: new Date().toISOString(),
			ks: state.keystore.serialize(),
			accounts:state.accounts,
		};
		localStore.set(localStorageKey, dump);
	},
	[types.DEL_TOKEN_REQUEST] (state) {
	},
	[types.DEL_TOKEN_SUCCESS] (state, data) {
		let arr = state.accounts[state.accounts.defaultAddress][state.accounts.defaultNetwork].tokens
		arr.splice(arr.findIndex(item => item === data), 1)
		initAccountTokens()
		const dump = {
			ver: '1',
			saved: new Date().toISOString(),
			ks: state.keystore.serialize(),
			accounts:state.accounts,
		};
		localStore.set(localStorageKey, dump);
	},

	[types.WALLET_LOCK] (state, data) {
		state.password = false
	},

	[types.WALLET_UNLOCK] (state, data) {
		state.password = data
	},
	[types.GET_PRICE_REQUEST] (state) {
		state.priceInfo = {}
		
	},
	[types.GET_PRICE_SUCCESS] (state, data) {
		state.priceInfo = {}
		for(let token of data){
			state.priceInfo[token.symbol.toLowerCase()] = {change24h:parseFloat(token.percent_change_24h),price:new BigNumber(token.price_usd)}
		}
	},
	[types.WALLET_EXIT_SUCCESS] (state, data) {

	},

	[types.CREATE_NEW_ACCOUNT_REQUEST] (state, data) {

	},

	[types.CREATE_NEW_ACCOUNT_SUCCESS] (state, data) {
		state.accounts.defaultAddress = data
		addAccountsToStore(data)
		initAccountTokens()
	},
	[types.LOAD_WALLET_REQUEST] (state, data) {

	},
	[types.LOAD_WALLET_SUCCESS] (state, data) {
		if(!state.hasLoadWallet){
			const dump = localStore.get(localStorageKey)
			if(dump){
				const ksDump = dump.ks;
				const ks = lightwallet.keystore.deserialize(ksDump);
				state.keystore = ks
				state.isComfirmed = true
				state.accounts = dump.accounts
				state.addresses = ks.getAddresses();
			}
			
		} 
	},
	
	[types.SEND_TRANSACTION_SUCCESS] (state, {idx, amount, token}) {
		if(!state.accounts[state.accounts.defaultAddress].transactions){
			state.accounts[state.accounts.defaultAddress].transactions = []
		}
		state.accounts[state.accounts.defaultAddress].transactions.push({
			idx,
			date: new Date().toISOString(),
			amount,
			token
		})
		setAccountsToStore()
	},

	[types.RESTORE_FROM_SEED_REQUEST] (state) {
		state.isFetching.restore = true
	},
	// 导入钱包
	[types.RESTORE_FROM_SEED_SUCCESS] (state, data) {
		state.seed = data.seed
		state.password = data.password
		state.isFetching.restore = false
	},
	[types.RESTORE_FROM_KEYSTORE_REQUEST] (state) {
		state.isFetching.restore = true
	},
	// 导入钱包(keystore)
	[types.RESTORE_FROM_KEYSTORE_SUCCESS] (state, data) {
		state.keystore = lightwallet.keystore.deserialize(data.keystore)
		state.password = data.password
		state.isFetching.restore = false
	},
	[types.RESTORE_FROM_KEYSTORE_ERROR] (state, data) {
		state.isFetching.restore = false
	},
	// 关闭钱包
	[types.WALLET_CLOSE_SUCCESS] (state) {
		localStore.remove(localStorageKey)
		state.accounts = {
			defaultAddress: false,
			defaultNetwork: 'Ropsten Testnet',
		}
		state.isComfirmed = false
	},
	// 产生助记词
	[types.GENERATE_WALLET_SUCCESS] (state, data) {
		state.seed = data.seed
		state.password = data.password
	},
	[types.GENERATE_KEYSTORE_SUCCESS] (state, data) {
		state.seed = data.seed
		state.keystore = data.keystore
		state.isComfirmed = true
		state.addresses = data.addresses

		initAccountTokens()
		state.status.hasLoadWallet = true
	},
	
	
	[types.NETWORK_CHANGE_SUCCESS] (state, data) {
		initAccountTokens()
		setAccountsToStore()
	},
	[types.GET_BALANCE_SUCCESS] (state) {
	},
	[types.CHANGE_ACCOUNT_SUCCESS] (state, data) {
		state.accounts.defaultAddress = data
		setAccountsToStore()
	},
	[types.INIT_TOKENS_SUCCESS] (state, data) {
		state.tokenInfo = TokenSelection[state.accounts.defaultNetwork].info
		for(let key in state.accounts.customToken){
			state.tokenInfo[key] = state.accounts.customToken[key]
		}
		state.tokens = state.accounts[state.accounts.defaultAddress][state.accounts.defaultNetwork].tokens.map(item => {
			return { info: state.tokenInfo[item],balance: 0, price: 0 }
		})
		state.addresses = []
		for(const address in state.accounts){
			if(state.accounts[address]['Offline']){
				state.addresses.push(address)
			}
		}
	},
	[types.ADD_CUSTOM_TOKEN_REQUEST] (state) {

	},
	[types.ADD_CUSTOM_TOKEN_SUCCESS] (state, data) {
		if(!state.accounts.customToken){
			state.accounts.customToken = {}
		}
		data.type = 'custom'
		state.accounts.customToken[data.symbol] = data
		state.accounts[state.accounts.defaultAddress][state.accounts.defaultNetwork].tokens.push(data.symbol)
		initAccountTokens()
		const dump = {
			ver: '1',
			saved: new Date().toISOString(),
			ks: state.keystore.serialize(),
			accounts:state.accounts,
		};
		localStore.set(localStorageKey, dump);
	},
	[types.CONTRACT_BUILD_REQUEST] (state, data) {

	},
	[types.CONTRACT_BUILD_SUCCESS] (state, data) {

	},
}

export default {
	namespaced: true,
	state,
	actions,
	mutations,
	getters
}
