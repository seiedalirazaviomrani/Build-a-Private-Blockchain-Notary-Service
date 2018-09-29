
const myPrivateBlockchain = require('./myPrivateBlockchain');
const blockchain = new myPrivateBlockchain.Blockchain();
const Block = require('./Block');
const StarValidation = require('./validation')

'use strict';
const Hapi=require('hapi');

// Create a server with a host and port
const server=Hapi.server({
    host:'localhost',
    port:8000
});

// Add the route
server.route([
    { method: 'GET',
    path:'/',
    handler: function(request,h){
        return "Welcome to the \"RESTful Web API with Hapi.js Framework\" project.";
    }},
    { method:'GET',
    path:'/block/{blockNumber}',
    handler:async function(request,h) {
    	let blockHeight = request.params.blockNumber;
    	if (blockHeight<0) {
    		return "ERROR!\n" + "Invalid Block Height!";
    	} else {
            return blockchain.getBlockByHeight(blockHeight);
    	}
    }},
    { method: 'POST',
    path: '/requestValidation',
    handler:async function(request,h) {
        if (request.payload === null){
            return "ERROR!\n" + "Please add your wallet address to the POST request!";
        } else {
            const starValidation = new StarValidation(request)
            const address = request.payload.address
            try{
                data = await starValidation.getInQueueRequests(address)
            } catch(error) {
                data = await starValidation.saveRequestValidation(address)
            }
            return JSON.stringify(data).toString();
        }
    }},
    { method: 'POST',
    path: '/message-signature/validate',
    handler:async function(request,h){
        if (request.payload === null){
            return "ERROR!\n" + "Please add your wallet address and message signature to the POST request!";
        } else {
            const starValidation = new StarValidation(request)
            try{
                const {address, signature} = request.payload
                const replyMsg = await starValidation.validateMsgSignature(address, signature)
                if (replyMsg.registerStar) {
                    return JSON.stringify(replyMsg).toString();
                } else {
                    return h.response(replyMsg).code(401)
                }
            } catch(error){
                h.response({
                    status: 404, message: error.message
                }).code(404)
            }
        }
    }},
    { method: 'POST',
    path: '/block',
    handler:async function(request,h){
        if (request.payload === null){
            return "ERROR!\n" + "Please add your wallet address and star information to the POST request!";
        } else {
            const starValidation = new StarValidation(request.payload)
            const body = {address, star} = request.payload
            const story = star.story
            try{
                const isValid = await starValidation.addressIsValid()
                if (!isValid) {
                    throw new Error("The signature isn't valid!")
                }
            } catch(error){
                h.response({
                    status: 401, 
                    message: error.message
                }).code(401)
                return
            }
            body.star = {
                dec: star.dec,
                ra: star.ra,
                story: new Buffer(story).toString('hex'),
                mag: star.mag,
                con: star.con
            }
            await blockchain.addBlock(new Block(body))
            const blockHeight = await blockchain.getHeight()
            const theNewBlock = await blockchain.getBlock(blockHeight)
            const response = h.response(theNewBlock).code(201)
            starValidation.deleteAddress(address)
            response.header('Content-Type', 'application/json; charset=utf-8');
            return response;
            // res.status(201).send(response)
        }
    }},
    { method: 'GET',
    path: '/stars/address:{address}',
    handler:async function(request,h){
        try{
            const blockAddress = encodeURIComponent(request.params.address);
            const block = await blockchain.getBlockByAddress(blockAddress)
            const response = h.response(block)
            response.header('Content-Type', 'application/json; charset=utf-8');
            return response;
        } catch(error){
            h.response({
            status: 404, 
            message: "Block Not Found"
            }).code(404) 
        }  
    }},
    { method: 'GET',
    path: '/stars/hash:{hash}',
    handler:async function(request,h){
        try{
            const hashString = encodeURIComponent(request.params.hash);
            const block = await blockchain.getBlockByHash(hashString)
            const response = h.response(block)
            response.header('Content-Type', 'application/json; charset=utf-8');
            return response;
        } catch(error){
            h.response({
            status: 404, 
            message: "Block Not Found"
            }).code(404) 
        }  
    }}
    // { method: 'GET',
    // path: '/stars/{height}',
    // handler:async function(request,h){
    //     try{
    //         const height = encodeURIComponent(request.params.height);
    //         const block = await blockchain.getBlockByHeight(height)
    //         const response = h.response(block)
    //         response.header('Content-Type', 'application/json; charset=utf-8');
    //         return response;
    //     } catch(error){
    //         h.response({
    //         status: 404, 
    //         message: "Block Not Found"
    //         }).code(404) 
    //     }  
    // }}
]);

// Start the server
async function start() {

    try {
        await server.start();
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
};


start();