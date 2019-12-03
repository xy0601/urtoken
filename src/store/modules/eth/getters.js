export const getSeed = state => state.seed
export const getPassword = state => state.password
export const getKeystore = state => state.keystore
export const getAddresses = state => state.addresses
export const isComfirmed = state => state.isComfirmed
export const getNetworkJson = state => state.network
export const getNetwork = state => {
	let array = []
	for(let key in state.network){
		array.push({name: key, data: state.network[key]})
	}
	return array
}
export const getAccounts = state => state.accounts
export const getTokens = state => state.tokens
export const getStatus = state => state.status
export const getTokenInfo = state=> state.tokenInfo




export const isFetching = state=> state.isFetching
export const getBlockNumber = state => state.blockNumber
export const getError = state => state.error
export const getTransactions = state => state.transactions
export const getTokenSel = state => state.tokenSel
export const getPrice = state => state.priceInfo