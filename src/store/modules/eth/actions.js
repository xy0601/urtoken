import api from '@/api/client'
import request from '@/utils/request'
import * as types from './mutation-types'
import moment from 'moment'
let timeOutNum = 100
import generateString from '@/utils/crypto'
import lightwallet from 'eth-lightwallet'
import HookedWeb3Provider from 'hooked-web3-provider'
import SignerProvider from '@/vendor/ethjs-provider/ethjs-provider-signer';
import { generatedPasswordLength, hdPathString, offlineModeString, defaultNetwork, localStorageKey, Gwei } from '@/utils/constants'
import Web3 from 'web3';
import { erc20Abi } from '@/utils/contracts/abi'
import Wallet from 'ethereumjs-wallet'
import Hdkey from 'ethereumjs-wallet/hdkey'
import Thirdparty from 'ethereumjs-wallet/thirdparty'
import BigNumber from 'bignumber.js'
import axios from 'axios'

let web3 = new Web3();
const erc20Contract = web3.eth.contract(erc20Abi);

//生成助记词

export const generateSeed = ({ commit }) => {
	return new Promise((resolve, reject) => {
		commit(types.GEN_SEED_REQUEST)
		setTimeout(() => {
			try{
				const password = generateString(generatedPasswordLength);
				const extraEntropy = generateString(generatedPasswordLength);

				
				const seed = lightwallet.keystore.generateRandomSeed(extraEntropy);
				var data = {password, seed}
				commit(types.GEN_SEED_SUCCESS, data)
				resolve(data)
			} catch(e) {
				reject(e)
			}
			
		}, timeOutNum)
	})
}

//导出私钥

export const getPrivateKey = ({ dispatch, commit, rootState },pwd) => {
	return new Promise((resolve, reject) => {
		setTimeout(async() => {
			try {
				let state = rootState.wallet.eth
				let keystore = state.keystore
				let address = state.accounts.defaultAddress
				if (!keystore) return reject(err);
				if (!pwd) return reject(err);
				await dispatch('keyFromPasswordPromise', {pwd, keystore}).then(pwDerivedKey=>{
					const isPasswordCorrect = keystore.isDerivedKeyCorrect(pwDerivedKey);
					if(isPasswordCorrect){
						let pkey = keystore.exportPrivateKey(address, pwDerivedKey)
						console.log('pkey')
						console.log(pkey)
						resolve(pkey)
					}else{
						reject('invalidPwd')
					}
				}).catch(err=>{
					reject(err)
				})
				//commit(types.CREATE_NEW_ACCOUNT_SUCCESS)
				resolve()
			} catch (err) {
				reject(err)	
			}
		}, timeOutNum)
	})
}

//导入钱包

export const restoreWallet = ({ dispatch, commit, rootState }, data) => {
	
	
	return new Promise((resolve, reject) => {
		commit(types.GEN_KEYSTORE_REQUEST)
		commit(types.RESTORE_FROM_SEED_REQUEST)
		setTimeout(() => {
			try {
				if(!lightwallet.keystore.isSeedValid(data.seed)){
					reject('not valid seed')
				}
				commit(types.RESTORE_FROM_SEED_SUCCESS,data)
				let state = rootState.wallet.eth
				const params = {
					password: state.password,
					seed: state.seed,
					hdPathString,
				}
				dispatch('generateKeystore', params).then(res => {
					resolve()
				}).catch(error => {
					reject(error)
				})
				
			} catch (err) {
				reject(err)	
			}
			
		}, timeOutNum)
	})
}

//导入钱包(keystore)

export const restoreWalletByKs = ({ dispatch, commit, rootState }, data) => {
	
	
	return new Promise((resolve, reject) => {
		commit(types.GEN_KEYSTORE_REQUEST)
		commit(types.RESTORE_FROM_KEYSTORE_REQUEST)
		setTimeout(async() => {
			try {
				let state = rootState.wallet.eth
				let keystore = JSON.parse(data.keystore)
				commit(types.RESTORE_FROM_KEYSTORE_SUCCESS,data)
				var wallet = Wallet.fromV3(keystore,data.password)
				const privateKey = wallet.getPrivateKeyString()
				const t = Thirdparty.fromEtherWallet(keystore,data.password)
				var hdkey = Hdkey.fromExtendedKey(privateKey)
				var w = hdkey.getWallet()
				keystore.generateNewAddress(wallet.getPrivateKey(),2);

				var addresses = keystore.getAddresses();
			} catch (err) {
				commit(types.RESTORE_FROM_KEYSTORE_ERROR)
				reject(err)	
			}
			
		}, timeOutNum)
	})
}

//关闭钱包

export const walletClose = ({ dispatch, commit }, data) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			try {
				commit(types.WALLET_CLOSE_SUCCESS)
				resolve()
			} catch (err) {
				reject(err)	
			}
			
		}, timeOutNum)
	})
}



//生成keystore

export const generateKeystore = ({ commit, rootState, dispatch }, data) => {
	return new Promise((resolve, reject) => {
		commit(types.GEN_KEYSTORE_REQUEST)
		setTimeout(() => {
			try {
				const password = data.password;
				const seedPhrase = data.seed;
				const param = {
				  	password,
				  	seedPhrase,
					hdPathString,
				};
				
				lightwallet.keystore.createVault(param, (err, ks) => {
					if (err !== null) {
						reject(err)
					}
					ks.keyFromPassword(password, (err, pwDerivedKey) => {
						
						if (err !== null) {
							reject(err)
						}
						ks.generateNewAddress(pwDerivedKey,2);

						var addresses = ks.getAddresses();
						const data = {
							seed: seedPhrase,
							keystore: ks,
							addresses
						}
						
						commit(types.GEN_KEYSTORE_SUCCESS, data)
						dispatch('initAccounts')
						resolve(data)
					});
				});
			} catch (err) {
				reject(err)	
			}
			
		}, timeOutNum)
	})
}

// 初始化钱包账户
export const initAccounts = async ({ dispatch, commit }) => {
	commit(types.INIT_ACCOUNT_REQUEST)
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			try {
				commit(types.INIT_ACCOUNT_SUCCESS)
				dispatch('initAccountTokens')
				resolve()
			} catch (err) {
				reject(err)	
			}
		}, 0)
	})
}

// 初始化钱包账户token
export const initAccountTokens = async ({ dispatch, commit }) => {
	commit(types.INIT_ACCOUNT_TOKENS_REQUEST)
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			try {
				commit(types.INIT_ACCOUNT_TOKENS_SUCCESS)
				dispatch('setNetwork')
				
			} catch (err) {
				reject(err)	
			}
		}, 0)
	})
}
// 设置网络
export const setNetwork = ({ commit,dispatch, rootState }) => {
	return new Promise((resolve, reject) => {
		commit(types.LOAD_NETWORK_REQUEST)
		setTimeout(() => {
			try {
				let state = rootState.wallet.eth
				let rpc = state.network[state.accounts.defaultNetwork].rpc
				let ks = state.keystore
				if (ks) {
					const web3Provider = new HookedWeb3Provider({
						host: rpc,
						transaction_signer: ks
					});
					web3.setProvider(web3Provider);
					
					getBlockNumberPromise().then(res => {
						//commit(types.NETWORK_CHANGE_SUCCESS)
						commit(types.LOAD_NETWORK_SUCCESS, res)
						dispatch('getAllTokensBalance')
						resolve(res)
					}).catch(error => {
						
						commit(types.LOAD_NETWORK_ERROR,'loadNetworkError')
						
						reject('loadNetworkError')
					})
				}else{
					reject()
				}
				
				
			} catch (err) {
				console.log('a')
				commit(types.LOAD_NETWORK_ERROR)
				reject('loadNetworkError')	
			}
			
		}, timeOutNum)
	})
}

// 获取钱包账户token余额

export const getAllTokensBalance = async ({ dispatch, commit, rootState }) => {
	commit(types.GET_ALL_BALANCE_REQUEST)
	return new Promise((resolve, reject) => {
		setTimeout(async() => {
			let data = rootState.wallet.eth.tokens
			let address = rootState.wallet.eth.accounts.defaultAddress
			let promiseArr = []
			for(let item of data){
				//item.balance = 'check...'
				
				if(item.info.symbol === 'eth'){
					promiseArr.push(getEthBalance({ commit }, address))
				} else {
					promiseArr.push(getTokenBalance({ commit }, {address, tokenContractAddress: item.info.contractAddress}))
				}
				
			}
			await Promise.all(promiseArr).then(res => {
				for(let i = 0; i<data.length; i++){
					data[i].balance = new BigNumber(res[i].div(10**data[i].info.decimals).toString());
				}
				commit(types.GET_ALL_BALANCE_SUCCESS)
				dispatch('getPrice')
				resolve()
			}).catch(e => {
				reject(e)
			})
		}, timeOutNum)
	})
}

// ------------------------------------------------


export const  getBlockNumberPromise = () => { 
	return new Promise((resolve, reject) => {
		web3.eth.getBlockNumber((err, data) => {
			if (err !== null) return reject(err);
			return resolve(data);
		});
	});
}

export const keyFromPasswordPromise = ({ commit, rootState, dispatch },{pwd, keystore}) => {
	return new Promise((resolve, reject) => {
		keystore.keyFromPassword(pwd, (err, data) => {
			if (err !== null) return reject(err)
			return resolve(data);
	  	})
	})
}

export const sendTransactionPromise = ({ commit, rootState, dispatch },params) => { // eslint-disable-line no-inner-declarations
	return new Promise((resolve, reject) => {
		if(params.token === 'eth'){
			web3.eth.sendTransaction(params, (err, data) => {
				
				if (err !== null) return reject(err)
				const dat = {
					idx: data,
					amount: params.value.toString(),
					token: params.token
				}
				commit(types.SEND_TRANSACTION_SUCCESS, dat)
				return resolve(data)
			})
		} else {
			const tokenContractAddress = params.contractAddress
			const tokenContract = erc20Contract.at(tokenContractAddress)
			const tokenParams = {
				from: params.from, 
				to: params.to,
				value: '0x0', 
				gasPrice: params.gasPrice, 
				gas: params.gas,
			}
			
			try{
				tokenContract.transfer.sendTransaction(params.to, params.amount, tokenParams, (err, data) => {
					if (err !== null) return reject(err)
					const dat = {
						idx: data,
						amount: params.value.toString(),
						token: params.token
					}
					commit(types.SEND_TRANSACTION_SUCCESS, dat)
					return resolve(data)
				});
			}catch (err) {
				reject(err)	
			}
			
		}
	})
}

// 加载钱包（刷新）
export const initWallet = ({ dispatch, commit }, data) => {
	return new Promise((resolve, reject) => {
		commit(types.LOAD_WALLET_REQUEST)
		setTimeout(() => {
			try {
				commit(types.LOAD_WALLET_SUCCESS, data)
				dispatch('initAccounts')
				resolve()
			} catch (err) {
				reject(err)	
			}
			
		}, timeOutNum)
	})
}

// 加载钱包（刷新）
export const loadWallet = ({ dispatch, commit, rootState }, data) => {
	return new Promise((resolve, reject) => {
		commit(types.LOAD_WALLET_REQUEST)
		setTimeout(() => {
			try {
				commit(types.LOAD_WALLET_SUCCESS, data)
				let state = rootState.wallet.eth
				if(state.keystore)
					dispatch('initAccountTokens')
				resolve()
			} catch (err) {
				reject(err)	
			}
			
		}, timeOutNum)
	})
}

// 切换账户

export const changeAccount = ({ commit, dispatch }, data) => {
	return new Promise((resolve, reject) => {
		setTimeout(async() => {
			try {
				commit(types.CHANGE_ACCOUNT_SUCCESS, data)
				await dispatch('initAccountTokens')
				resolve()
			} catch (err) {
				reject(err)	
			}
			
		}, 0)
	})
}

//切换网络

export const changeNetwork = ({ commit, dispatch }) => {
	return new Promise((resolve, reject) => {
		commit(types.NETWORK_CHANGE_REQUEST)
		setTimeout(async() => {
			try {
				commit(types.NETWORK_CHANGE_SUCCESS)
				await dispatch('initAccounts')
				resolve()
			} catch (err) {
				reject(err)	
			}
			
		}, 0)
	})
}

// 获取balance余额

export const getEthBalance = ({ commit }, address) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			web3.eth.getBalance(address, (err, data) => {
				if (err !== null) return reject(err);
				return resolve(data);
			});
			
		}, 0)
	})
}


export const getTokenBalance = ({ commit }, {address, tokenContractAddress} ) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			const tokenContract = erc20Contract.at(tokenContractAddress);
			tokenContract.balanceOf.call(address, (err, balance) => {
				if (err) return reject(err);
				return resolve(balance);
			});
			
		}, 0)
	})
}


//锁定钱包

export const lockWallet = async ({ dispatch, commit }) => {
	
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			try {
				commit(types.WALLET_LOCK)
				resolve()
			} catch (err) {
				reject(err)	
			}
		}, 0)
	})
}

//解锁钱包

export const unLockWallet = async ({ dispatch, commit }, data) => {
	
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			try {
				commit(types.WALLET_UNLOCK, data)
				resolve()
			} catch (err) {
				reject(err)	
			}
		}, 0)
	})
}

//创建新账户

export const createNewAccount = async ({ dispatch, commit, rootState }, pwd) => {
	
	return new Promise((resolve, reject) => {
		commit(types.CREATE_NEW_ACCOUNT_REQUEST)
		setTimeout(async() => {
			try {
				let state = rootState.wallet.eth
				let keystore = state.keystore
				if (!keystore) return reject(err);
				if (!pwd) return reject(err);
				await dispatch('keyFromPasswordPromise', {pwd, keystore}).then(pwDerivedKey=>{
					const isPasswordCorrect = keystore.isDerivedKeyCorrect(pwDerivedKey);
					if(isPasswordCorrect){
						keystore.generateNewAddress(pwDerivedKey, 1);
						const newAddress = keystore.getAddresses().slice(-1)[0];
						commit(types.CREATE_NEW_ACCOUNT_SUCCESS, newAddress)
						dispatch('getAllTokensBalance')
						resolve()
					}else{
						reject('invalidPwd')
					}
				}).catch(err=>{
					reject(err)
				})
				//commit(types.CREATE_NEW_ACCOUNT_SUCCESS)
				resolve()
			} catch (err) {
				reject(err)	
			}
		}, 0)
	})
}

//修改账户

export const editNewAccount = async ({ dispatch, commit }, {name}) => {
	commit(types.EDIT_ACCOUNT_REQUEST)
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			try {
				
				commit(types.EDIT_ACCOUNT_SUCCESS, name)
				resolve()
			} catch (err) {
				reject(err)	
			}
		}, 0)
	})
}

//删除账户

export const delAccount = async ({ dispatch, commit }, {address}) => {
	commit(types.DEL_ACCOUNT_REQUEST)
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			try {
				
				commit(types.DEL_ACCOUNT_SUCCESS, address)
				resolve()
			} catch (err) {
				reject(err)	
			}
		}, 0)
	})
}

//添加token

export const addToken = async ({ dispatch, commit }, symbol) => {
	commit(types.ADD_TOKEN_REQUEST)
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			try {
				
				commit(types.ADD_TOKEN_SUCCESS, symbol)
				resolve()
			} catch (err) {
				reject(err)	
			}
		}, 0)
	})
}

//添加token

export const delToken = async ({ dispatch, commit }, symbol) => {
	commit(types.DEL_TOKEN_REQUEST)
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			try {
				
				commit(types.DEL_TOKEN_SUCCESS, symbol)
				resolve()
			} catch (err) {
				reject(err)	
			}
		}, 0)
	})
}

// 获取汇率

export const getPrice = async ({ dispatch, commit }) => {
	commit(types.GET_PRICE_REQUEST)
	return new Promise((resolve, reject) => {
		setTimeout(async() => {
			const data = await request('https://api.coinmarketcap.com/v1/ticker/')
			commit(types.GET_PRICE_SUCCESS,data)
			resolve()
		}, timeOutNum)
	})
}

//contract

export const contract = async ({ dispatch, commit }, code) => {
	commit(types.CONTRACT_BUILD_REQUEST)
	return new Promise((resolve, reject) => {
		setTimeout(async() => {
			//const compiledCode = solc.compile(code)
			//cconsole.log(compiledCode)
			commit(types.CONTRACT_BUILD_SUCCESS,code)
			resolve()
		}, timeOutNum)
	})
}

//add custom token

export const addCustomToken = async ({ dispatch, commit }, data) => {
	console.log(data)
	commit(types.ADD_CUSTOM_TOKEN_REQUEST)
	return new Promise((resolve, reject) => {
		setTimeout(async() => {
			commit(types.ADD_CUSTOM_TOKEN_SUCCESS,data)
			resolve()
		}, timeOutNum)
	})
}


//get eth

export const getEth = async ({ dispatch, commit }, data) => {
	console.log(data)
	commit(types.ADD_CUSTOM_TOKEN_REQUEST)
	return new Promise((resolve, reject) => {
		setTimeout(async() => {
			var headers = {
				'X-Requested-With': 'XMLHttpRequest',
				'Content-Type': 'application/rawdata',
			}
			const res = await axios({
				method: 'post',
				url: 'https://faucet.metamask.io/?' + data,
				headers: headers
			})
			console.log(res)
			resolve(res)
		}, timeOutNum)
	})
}