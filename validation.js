const level = require('level');
const starDB = './stardata';
const db = level(starDB);
const bitcoinMessage = require('bitcoinjs-message');
const verificationTimeWall = 5*60*1000;

class Validation{
	constructor (req){
		this.req = req;
	}

	addressIsValid(){
		return db.get(this.req.address).then((value) => {
			value = JSON.parse(value)
			return value.messageSignature === 'valid'
		})
		.catch(() => {throw new Error('Invalid!')})
	}

	deleteAddress(address){
		db.del(address)
	}

	async validateMsgSignature(address, signature){
		return new Promise((resolve, reject) => {
			db.get(address, (error, value) => {
				if (value === undefined) {
					return reject(new Error("Not Found"))
				} else if (error) {
					return reject(error)
				}
				value = JSON.parse(value)
				if (value.messageSignature === 'valid') {
					return resolve({
						registerStar: true,
						status: value
					})
				} else {
					const expired = value.requestTimeStamp < (Date.now() - verificationTimeWall)
					let isValid = false
					if (expired) {
						value.validationWindow = 0
						value.messageSignature = 'Validation window is expired!'
					} else {
						value.validationWindow = Math.round((value.requestTimeStamp - (Date.now() - verificationTimeWall))/1000)
						try{
							isValid = bitcoinMessage.verify(value.message, address, signature)
						} catch(error){
							isValid = false
						}
						if (isValid) {
							value.messageSignature = 'valid'
						} else {
							value.messageSignature = 'invalid'
						}
					}
					db.put(address, JSON.stringify(value))
					return resolve({
						registerStar: !expired && isValid,
						status: value
					})
				}
			})
		})
	}

	saveRequestValidation(address){
		const timeStamp = Date.now()
		const msg = `${address}:${timeStamp}:starRegistry`
		const fiveMins = 5*60
		const data = {
			address: address,
			message: msg,
			requestTimeStamp: timeStamp,
			validationWindow: fiveMins
		}
		db.put(data.address, JSON.stringify(data))
		return data
	}

	async getInQueueRequests(address){
		const expired = value.requestTimeStamp < (Date.now() - verificationTimeWall)
		return new Promise((resolve, reject) => {
			db.get(address, (error, value) => {
				if (value === undefined) {
					return reject(new Error("Not Found!"))
				} else if (error) {
					return reject(error)
				}
				value = JSON.parse(value)
				if (expired) {
					resolve(this.saveRequestValidation(address))
				} else {
					const data = {
						address: address,
						message: value.message,
						requestTimeStamp: value.requestTimeStamp,
						validationWindow: Math.round((value.requestTimeStamp - (Date.now() - verificationTimeWall))/1000)
					}
					resolve(data)
				}
			})
		})
	}
}

module.exports = Validation



	// validateAddressParams(){
	// 	if (!this.req.body.address) {
	// 		throw new Error("Please add your wallet address!")
	// 	}
	// 	return true
	// }

	// validateSignatureParams(){
	// 	if (!this.req.bogy.signature) {
	// 		throw new Error("Please add your signature!")
	// 	}
	// }

	// validateNewStarRequest(){
	// 	const story_length = 500
	// 	const {star} = this.req.body
	// 	const {dec, ra, story} = star
	// 	const isASCII = ((str) => /^[\x00-\x7F]*$/.test(str))

	// 	if (!this.validateAddressParams() || !this.req.body.star) {
	// 		throw new Error("Please add your wallet address and star parameters!")
	// 	}
	// 	if (!story.length || !ra.length || !dec.length ||
	// 		typeof story !== 'string' || typeof ra !== 'string' || typeof dec !== 'string') {
	// 		throw new Error("Please input correct data for dec, ra and story!")
	// 	}

	// 	if (new Buffer(story).length > story_length) {
	// 		throw new Error("Your star story is too long!")
	// 	}

	// 	if (!isASCII(story)) {
	// 		throw new Error("Please enter only ASCII sympols!")
	// 	}
	// }