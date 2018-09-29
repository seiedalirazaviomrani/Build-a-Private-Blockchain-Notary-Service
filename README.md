# RESTful Web API with Hapi.js Framework

This project is to build a RESTful API using a Hapi.js framework that will interfaces with the private blockchain By configuring an API for your private blockchain you expose functionality that can be consumed by several types of web clients ranging from desktop, mobile, and IoT devices. The API project will require two endpoints:

* GET block
* POST block

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

For testing the endpoints, try one of the tools listed below:

- [Postman](https://www.getpostman.com/) is a powerful tool used to test web services. It was developed for sending HTTP requests in a simple and quick way.
- [CURL](https://curl.haxx.se/) is a command-line tool used to deliver requests supporting a variety of protocols like HTTP, HTTPS, FTP, FTPS, SFTP, and many more.

## Running the tests

To test code:

1: Open a command prompt or shell terminal after install node.js.

2: Enter a node session, also known as REPL (Read-Evaluate-Print-Loop).
```
node
```
3: Run the index.js file.
```
node index.js
```
4: Open another command prompt or shell terminal after loading index.js.

5: Run the following command in the new command prompt or shell terminal to add a block to the chain.
```
curl -H "Content-Type: application/json" -X POST http://localhost:8000/block -d "{\"body\":\"Testing block with test string data\"}"
```
6: Run the following command in the new terminal to call a block from the chain. (The following example calls the block 1 from the chain.)
```
curl "http://localhost:8000/block/1"
```

## `GET` and `POST` endpoints

I have three endpoints in this project that listed below:

1. The root `GET` route with `/` path address. You can test this route by following curl command:
```
curl "http://localhost:8000/"
```
and the result is the same as the following:
```
Welcome to the "RESTful Web API with Hapi.js Framework" project.
```

2. Another `GET` method to get a block of the chain with `/block/{blockNumber}` path address. You can test this route by following sample curl command:
```
curl "http://localhost:8000/block/0"
```
and the result is the same as the following. This curl command is to call the genesis block of the chain.
```
{"hash":"6f36f41443ac07901c3d1c96f42d99e0399fb45b434fd07e858c65828481b1e3","height":0,"body":"The first block in the chain -- Genesis block.","time":"1536436758","previousBlockHash":""}
```

3. The `POST` method to add a new block to the chain with `/block` path address. You can test this route by following sample curl command:
```
curl -H "Content-Type: application/json" -X POST http://localhost:8000/block -d "{\"body\":\"Testing block with test string data\"}"
```
and the response for the endpoint is a block object in JSON format same as the following:
```
{"body":"Testing block with test string data"}
```

## Built With

* [Hapi.js Framework](https://hapijs.com/) - The web framework used
* [LevelDB](https://github.com/Level/level) - Persist data with LevelDB
* [Crypto-js](https://www.npmjs.com/package/crypto-js) - SHA256 with Crypto-js

## Author

**Seied Ali Razavi Omrani** - [GitHub profile](https://github.com/seiedalirazaviomrani)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
