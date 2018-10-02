// SHA256 with Crypto-js
const SHA256 = require('crypto-js/sha256');
const Block = require('./Block')
// Persist data with LevelDB
// https://github.com/Level/level
const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);


// Add data to levelDB with key/value pair
function addLevelDBData(key,value){
	db.put(key, JSON.stringify(value), function(err){
		if (err) return console.log('Block ' + key + ' submission failed!', err);
	})
}

// Add block to the levelDB with value
function addDataToLevelDB(value){
	let i = 0;
	db.createReadStream().on('data', function(data){
		i++;
	}).on('error', function(err){
		return console.log('Unable to read data stream!', err)
	}).on('close', function(){
		console.log('Block #' + i + ' added to chain!');
		addLevelDBData(i, value);
	});
}

// Get data from levelDB with key
function getLevelDBData(key){
	return new Promise((resolve, reject) =>{
		db.get(key, function(err, value){
			if(err){
				console.log("Not found!", err);
				reject(err);
			} else{
				resolve(value);
			}
		});
	});
}

// Class with a constructor for new blockchain.
class Blockchain{
	constructor(){
		let block = new Block();
		let that = this;
		db.createReadStream().on('data', function(data){
			block = JSON.parse(data.value);
			console.log(data.key, block);
		}).on('error', function(err){
			console.log('Unable to read data stream!', err);
		}).on('close', function(){
			that.getBlockHeight()
			.then(height =>{
				if(height === -1){
					that.addBlock(new Block("The first block in the chain -- Genesis block."));
				}
			});
		});
	}
	// Add new block
	addBlock(newBlock){
		// Block height
        let that = this;
		this.getBlockHeight()
		.then(height => {
			newBlock.height = (height+1);
			// Previous block hash
			if(height > -1){
				getLevelDBData(height)
				.then(function(result){
					newBlock.previousBlockHash = JSON.parse(result).hash;

					// UTC timestamp
					newBlock.time = new Date().getTime().toString().slice(0,-3);
	
					// Block hash with SHA256 using newBlock and converting to a string value.
					newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
					
					// Adding block object to the LevelDB
					addDataToLevelDB(newBlock);
				});
			} else {
					// UTC timestamp
					newBlock.time = new Date().getTime().toString().slice(0,-3);

					// Block hash with SHA256 using newBlock and converting to a string value.
					newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
					
					// Adding block object to the LevelDB
					addDataToLevelDB(newBlock);
			}
		});
	}
	// Get block height
	getBlockHeight(){
		return new Promise(function(resolve, reject){
			let height = -1;
			db.createReadStream().on('data', function(data){
				height++;
			}).on('error', function(err){
				console.log('Unable to read data stream!', err)
			}).on('close', function(){
				return resolve(height);
			});
		});
	}


	async getHeight(){
		return await this.getBlockHeight()
	}
	// Get block
	// async getBlock(blockHeight){
	// 	return await this.getHeight(blockHeight)
	// }
	async getBlock(blockHeight){
		return new Promise((resolve, reject) =>{
			db.get(blockHeight, function(err, value){
				if(err){
					console.log("Not found!", err);
					reject(err);
				} else{
					resolve(value);
				}
			});
		}); 
	}
	// Validate block
	validateBlock(blockHeight){
		return getLevelDBData(blockHeight)
		.then((result) => {
			// Convert string to the JSON object
			let block = JSON.parse(result);
			let blockHash = block.hash;
			block.hash = '';
			let validBlockHash = SHA256(JSON.stringify(block)).toString();
			if (blockHash === validBlockHash) {
				return true;
			} else {
				console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
				return false;
			}
		});
	}

	// Validate Blockchain
	validateChain(){
		let errorLog = [];
		let that = this;
		that.getBlockHeight() .then(height => {
			(function theLoop (i) {
				setTimeout(function () {
					if (!that.validateBlock(i)) errorLog.push(i);
					if(i > 0){
						getLevelDBData(i).then(result =>{
							let blockHash = result.previousBlockHash;
							let previousHash = result[i-1].hash;
							if (blockHash !== previousHash){
								errorLog.push(i);
							}
						});
					}
    			if (i<height) theLoop(i);
  				}, 100);
			})(height-1);
		});
		if (errorLog.length > 0){
			console.log("Block errors = " + errorLog.length);
			console.log("Blocks: " + errorLog);
		} else {
			console.log("No errors detected in the Blockchain!");
		}
	}

	async getBlockByAddress(address){
		const blocks = []
		let block
		return new Promise((resolve, reject) => {
			db.createReadStream().on('data', (data) =>{
				if (!(parseInt(data.key) === 0)) {
					block = JSON.parse(data.value)
					if (block.body.address === address) {
						block.body.star.storyDecoded = new Buffer(block.body.star.story, 'hex').toString()
						blocks.push(block)
					}
				}
			}).on('error',(error) =>{
				return reject(error)
			}).on('close',() =>{
				return resolve(blocks)
			})
		})
	}

	async getBlockByHash(hash){
		let block
		return new Promise((resolve, reject) =>{
			db.createReadStream().on('data', (data) =>{
				block = JSON.parse(data.value)
				if (block.hash === hash) {
					if (!(parseInt(data.key) === 0)) {
						block.body.star.storyDecoded = new Buffer(block.body.star.story, 'hex').toString()
						return resolve(block)
					} else {
						return resolve(block)
					}
				}
			}).on('error', (error) => {
				return reject(error)
			}).on('close', () =>{
				return reject("Not Found!")
			})
		})
	}

	async getBlockByHeight(height){
		return new Promise((resolve, reject) =>{
			db.get(height, (error, value) =>{
				if (value === undefined) {
					return reject("Not Found!")
				} else if (error) {
					return reject(error)
				}
				value = JSON.parse(value)
				if (parseInt(height) > 0) {
					value.body.star.storyDecoded = new Buffer(value.body.star.story, 'hex').toString()
				}
				return resolve(value)
			})
		})
	}
}

module.exports.Blockchain = Blockchain;