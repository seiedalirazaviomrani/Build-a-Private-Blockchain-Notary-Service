# Build a Private Blockchain Notary Service

In this project, I made a __Star Registry__ service that allows users to claim ownership of their favorite star in the night sky. I connected my web service to my own private blockchain, allowing users to notarize ownership of a digital asset, in this case whichever star they choose.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the [Node.js® web site](https://nodejs.org/en/).

### Installing

- Use NPM to initialize your project and create package.json to store project dependencies.
```
npm init
```
- Install crypto-js with --save flag to save dependency to our package.json file
```
npm install crypto-js --save
```
- Install level with --save flag
```
npm install level --save
```
- Install hapi.js with --save flag
```
npm install hapi --save
```
- Install bitcoinjs-lib with --save flag
```
npm config set python "C:\Python27\python.exe" npm install bitcoinjs-lib --save
```
- Install bitcoinjs-message with --save flag
```
npm install bitcoinjs-message --save
```

For testing the endpoints, try one of the tools listed below:

- [Postman](https://www.getpostman.com/) is a powerful tool used to test web services. It was developed for sending HTTP requests in a simple and quick way.
- [CURL](https://curl.haxx.se/) is a command-line tool used to deliver requests supporting a variety of protocols like HTTP, HTTPS, FTP, FTPS, SFTP, and many more.

# Endpoint description

## 1. Blockchain ID validation
__Method__
```
POST
```
__Endpoint__
```
http://localhost:8000/requestValidation
```
__Parameter__
```
address - A bitcoin wallet address, you can take it from Electrum software.
```
__Example__
Here is an example post request using curl
```
curl -H "Content-Type: application/json; charset=utf-8" -X POST http://localhost:8000/requestValidation -d "{\"address\":\"n3LFwhbm23GfF3yo5wXVJLnHi6WJ7LEcPv\"}"
```
Here is an example of JSON response
```
{"address":"n3LFwhbm23GfF3yo5wXVJLnHi6WJ7LEcPv","message":"n3LFwhbm23GfF3yo5wXVJLnHi6WJ7LEcPv:1538339165931:starRegistry","requestTimeStamp":1538339165931,"validationWindow":300}
```

## 2. Message signature validation
__Method__
```
POST
```
__Endpoint__
```
http://localhost:8000/message-signature/validate
```
__Parameters__
```
address - The wallet address that you used in the previous step.
signature - You can take it from the Electrum wallet. Please see the below screenshot
```
<img src="https://github.com/seiedalirazaviomrani/Build-a-Private-Blockchain-Notary-Service/img/img1.png">

__Example__
Post validation with curl
```
curl -H "Content-Type: application/json; charset=utf-8" -X POST http://localhost:8000/message-signature/validate -d "{\"address\":\"n3LFwhbm23GfF3yo5wXVJLnHi6WJ7LEcPv\",\"signature\":\"H8NICOgodzO1Xb4z4gxIj+x3lot01ozzRniWD67Np8NaCR0o+cnldLedSt/UCwruEUgrRUmYAo92Xsyj/l0WTKQ=\"}"
```
JSON Response Example
```
{"registerStar":true,"status":{"address":"n3LFwhbm23GfF3yo5wXVJLnHi6WJ7LEcPv","message":"n3LFwhbm23GfF3yo5wXVJLnHi6WJ7LEcPv:1538339165931:starRegistry","requestTimeStamp":1538339165931,"validationWindow":250,"messageSignature":"valid"}}
```

## 3. Star Registration
__Method__
```
POST
```
__Endpoint__
```
http://localhost:8000/block
```
__Parameters__
```
address - The wallet address that you used in the first step.
star - Containing dec, ra and story (max 500 bytes)
```
__Example__
Post block with curl
```
curl -X POST http://localhost:8000/block -H "Content-Type: application/json; charset=utf-8" -d "{\"address\": \"n3LFwhbm23GfF3yo5wXVJLnHi6WJ7LEcPv\",\"star\":{\"dec\":\"-26° 29' 24.9\",\"ra\":\"16h 29m 1.0s\",\"story\":\"Found star using https://www.google.com/sky/\"}}"
```
JSON Response Example
```
{"hash":"5011a047272b648f085fc65eed8ae12948465a0e83e6a5b728e0025b89886769","height":3,"body":{"address":"n3LFwhbm23GfF3yo5wXVJLnHi6WJ7LEcPv","star":{"dec":"-26∩┐╜ 29' 24.9","ra":"16h 29m 1.0s","story":"466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"}},"time":"1538339012","previousBlockHash":"154ebbbe349b4730fae551f69cba5b05c9e417a0a5905de5a9034211ac46871f"}
```

## 4. Get block by address
__Method__
```
GET
```
__Endpoint__
```
http://localhost:8000/stars/address:[ADDRESS]
```
__Parameter__
```
address - The wallet address that you used in the first step.
```
__Example__
Get request with curl
```
curl "http://localhost:8000/stars/address:n3LFwhbm23GfF3yo5wXVJLnHi6WJ7LEcPv"
```
JSON Response Example
```
[{"hash":"21d3f2d9a2d64988c60c687446dca29ebba5cf826188e96eb81e462761b00fc4","height":1,"body":{"address":"n3LFwhbm23GfF3yo5wXVJLnHi6WJ7LEcPv","star":{"dec":"-26∩┐╜ 29' 24.9","ra":"16h 29m 1.0s","story":"466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f","storyDecoded":"Found star using https://www.google.com/sky/"}},"time":"1538338530","previousBlockHash":"3855961ec57f82d76526623b1e0a3f638d4398eb682db8ea692da51b7bca8bbb"},{"hash":"154ebbbe349b4730fae551f69cba5b05c9e417a0a5905de5a9034211ac46871f","height":2,"body":{"address":"n3LFwhbm23GfF3yo5wXVJLnHi6WJ7LEcPv","star":{"dec":"-26∩┐╜ 29' 24.9","ra":"16h 29m 1.0s","story":"466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f","storyDecoded":"Found star using https://www.google.com/sky/"}},"time":"1538338638","previousBlockHash":"21d3f2d9a2d64988c60c687446dca29ebba5cf826188e96eb81e462761b00fc4"},{"hash":"5011a047272b648f085fc65eed8ae12948465a0e83e6a5b728e0025b89886769","height":3,"body":{"address":"n3LFwhbm23GfF3yo5wXVJLnHi6WJ7LEcPv","star":{"dec":"-26∩┐╜ 29' 24.9","ra":"16h 29m 1.0s","story":"466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f","storyDecoded":"Found star using https://www.google.com/sky/"}},"time":"1538339012","previousBlockHash":"154ebbbe349b4730fae551f69cba5b05c9e417a0a5905de5a9034211ac46871f"},{"hash":"b8de6ccbcafa53abdda9f950c5f52e4a67f3e9b479735967d5661d55c764a28c","height":4,"body":{"address":"n3LFwhbm23GfF3yo5wXVJLnHi6WJ7LEcPv","star":{"dec":"-26∩┐╜ 29' 24.9","ra":"16h 29m 1.0s","story":"466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f","storyDecoded":"Found star using https://www.google.com/sky/"}},"time":"1538339251","previousBlockHash":"5011a047272b648f085fc65eed8ae12948465a0e83e6a5b728e0025b89886769"}]
```

## 5. Get block by hash
__Method__
```
GET
```
__Endpoint__
```
http://localhost:8000/stars/hash:[HASH]
```
__Parameter__
```
hash - The hash string of one block created before
```
__Example__
Get request with curl
```
curl "http://localhost:8000/stars/hash:5011a047272b648f085fc65eed8ae12948465a0e83e6a5b728e0025b89886769"
```
JSON Response Example
```
{"hash":"5011a047272b648f085fc65eed8ae12948465a0e83e6a5b728e0025b89886769","height":3,"body":{"address":"n3LFwhbm23GfF3yo5wXVJLnHi6WJ7LEcPv","star":{"dec":"-26∩┐╜ 29' 24.9","ra":"16h 29m 1.0s","story":"466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f","storyDecoded":"Found star using https://www.google.com/sky/"}},"time":"1538339012","previousBlockHash":"154ebbbe349b4730fae551f69cba5b05c9e417a0a5905de5a9034211ac46871f"}
```

## 6. Get block by height
__Method__
```
GET
```
__Endpoint__
```
http://localhost:8000/block/[HEIGHT]
```
__Parameter__
```
height - The height of block
```
__Example__
Get request with curl
```
curl "http://localhost:8000/block/1"
```
JSON Response Example
```
{"hash":"21d3f2d9a2d64988c60c687446dca29ebba5cf826188e96eb81e462761b00fc4","height":1,"body":{"address":"n3LFwhbm23GfF3yo5wXVJLnHi6WJ7LEcPv","star":{"dec":"-26∩┐╜ 29' 24.9","ra":"16h 29m 1.0s","story":"466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f","storyDecoded":"Found star using https://www.google.com/sky/"}},"time":"1538338530","previousBlockHash":"3855961ec57f82d76526623b1e0a3f638d4398eb682db8ea692da51b7bca8bbb"}
```

## Built With

* [Hapi.js Framework](https://hapijs.com/) - The web framework used
* [LevelDB](https://github.com/Level/level) - Persist data with LevelDB
* [Crypto-js](https://www.npmjs.com/package/crypto-js) - SHA256 with Crypto-js
* [Bitcoinjs-Message](https://github.com/bitcoinjs/bitcoinjs-message) - Bitcoinjs-Message
* [Bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib) - Bitcoinjs Library

## Author

**Seied Ali Razavi Omrani** - [GitHub profile](https://github.com/seiedalirazaviomrani)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
