const level = require('level');
const starDB = './stardata';
const db = level(starDB);
const bitcoinMessage = require('bitcoinjs-message');
const verificationTimeWall = 5*60*1000; //Five Minutes

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