# Auctionfity: Cheap NFT Auction House Example
Author: **Patricio J Gerpe**
Onchain - Offchain Auction House to list NFT and trade them for ERC20 Tokens.

## Architecture:

Express, Nodemon, NodeJs, Typescript, Hardhat, Ethers, Solidity, OpenZepellin, Typechain, Ropsten. Chai, Solhint, Prettier and Eslint are used for Quality Control.

![image](https://user-images.githubusercontent.com/16574952/183387931-655881cf-61ac-484b-89b7-40568a6fd225.png)

**Case outline:**

NFT marketplaces often use techniques for reducing transaction fees.
Some of these techniques require users to use these marketplaces with an off-chain
sibling system that assist the on-chain pieces. This is a simple off-chain system
and the on-chain smart-contract to enable cheap auctions. The goal is to enable
trades between an ERC721 and a ERC20 with a single on-chain transaction.

## Installation

```shell
npm i .
```

## To run in development (Local Test Network)

```shell
npm run start:node
npm run deploy:dev
npm run start
```
![image](https://user-images.githubusercontent.com/16574952/183389011-662ee451-e537-402b-bf7e-24ea556be9b8.png)
![image](https://user-images.githubusercontent.com/16574952/183389105-9f39441f-60b0-4f7d-a5f5-944633229691.png)
![image](https://user-images.githubusercontent.com/16574952/183389194-b300cb15-98a3-46ad-b9ef-9c23b7b968ab.png)

![image](https://user-images.githubusercontent.com/16574952/183389286-7ee8b456-a1d3-4d9c-927d-464688665deb.png)

You can test with 

```shell
npm run test
```

![image](https://user-images.githubusercontent.com/16574952/183390166-32026637-0a29-401d-b7c0-2ecac5496c37.png)

*(TODO: Finish UT for settleTransaction function which can be tested via PostMan now)*


## To run in stagging (Ropsten Test Network)

Fill out environment variables following ".env.example".

Then...

```shell
npm run deploy:stag
npm run start
```

# APPLICATION ENDPOINTS:

![image](https://user-images.githubusercontent.com/16574952/183391150-5cb8c680-17b8-4b60-a4cd-2d724c5f7f66.png)

(You can import postmanCollection from ./data folder)

```shell
curl --location --request GET '127.0.0.1:3000/api/accounts'
```
![image](https://user-images.githubusercontent.com/16574952/183391499-bb7564f4-f613-4a63-b145-00f2b084e976.png)

```shell
curl --location --request POST '127.0.0.1:3000/api/init'
```
![image](https://user-images.githubusercontent.com/16574952/183391777-64ee6b83-baee-4ba4-814f-434d37ed1fb7.png)

```shell
curl --location --request POST '127.0.0.1:3000/api/nfts/approve' \
--header 'Content-Type: application/json' \
--data-raw '{"nfts": [{"tokenId": 1, "price": 0.035}, {"tokenId": 2, "price": 0.035}]}'
```
![image](https://user-images.githubusercontent.com/16574952/183391949-b1eace31-45ac-4df4-9b71-5af200806e7a.png)

```shell
curl --location --request GET '127.0.0.1:3000/api/nfts' \
--header 'Content-Type: application/json' \
--data-raw '{"nfts": [{"tokenId": 1, "price": 0.035}]}'
```
![image](https://user-images.githubusercontent.com/16574952/183392328-341fc30e-093d-45d2-b30e-62fa595855a7.png)

```shell
curl --location --request POST '127.0.0.1:3000/api/token/approve' \
--header 'Content-Type: application/json' \
--data-raw '{"quantity": 1000000000000000}'
```
![image](https://user-images.githubusercontent.com/16574952/183392745-33f0dd71-e631-4583-a9f2-7462d015387f.png)

```shell
curl --location --request POST '127.0.0.1:3000/api/nfts/list' \
--header 'Content-Type: application/json' \
--data-raw '{"nft": {"tokenId": 1}, "minPrice": 50}'
```

![image](https://user-images.githubusercontent.com/16574952/183392907-015acfc3-f6ca-4de1-a80f-0f6fcb003dbc.png)

```shell
curl --location --request GET '127.0.0.1:3000/api/nfts/listings?startTime=2021-06-01&endTime=2022-09-09'
```

![image](https://user-images.githubusercontent.com/16574952/183393032-0099e937-91be-46cd-9747-83cc50096291.png)

```shell
curl --location --request POST '127.0.0.1:3000/api/nfts/listings/bid-offer' \
--header 'Content-Type: application/json' \
--data-raw '{"price": 90, "tokenId": 1}'
```

![image](https://user-images.githubusercontent.com/16574952/183393415-e0bc451b-61d2-4f21-9c0f-b162eb98acf7.png)

```shell
curl --location --request GET '127.0.0.1:3000/api/nfts/listings/bids?startTime=2021-06-01&endTime=2022-09-09&tokenId=1'
```

![image](https://user-images.githubusercontent.com/16574952/183393625-9c89698e-0039-41d7-b881-7a307d187b44.png)

```shell
curl --location --request POST '127.0.0.1:3000/api/nfts/listings/bid-accept' \
--header 'Content-Type: application/json' \
--data-raw '{"price": 50, "tokenId": 1}'
```

![image](https://user-images.githubusercontent.com/16574952/183393792-324e271f-03bc-4eea-97c8-891bdfe8840b.png)

```shell
curl --location --request GET '127.0.0.1:3000/api/signatures?startTime=2021-06-01&endTime=2022-09-09'
```

![image](https://user-images.githubusercontent.com/16574952/183394046-a9224810-44ed-45d8-91d1-dfff75557268.png)

```shell
curl --location --request POST '127.0.0.1:3000/api/nfts/settle' \
--header 'Content-Type: application/json' \
--data-raw '{"tokenId": 1, "bidderSignature": {
        "r": "0x7f6e2a6fce8f54b25ef0f5dba37d6c4b1a063ce3c7afc0ee3ba6568619777fbb",
        "s": "0x75c4cdc54ecedf68a43775742f3fe5b956098ca0ff8f95c824b47816a723d01c",
        "_vs": "0xf5c4cdc54ecedf68a43775742f3fe5b956098ca0ff8f95c824b47816a723d01c",
        "recoveryParam": 1,
        "v": 28,
        "yParityAndS": "0xf5c4cdc54ecedf68a43775742f3fe5b956098ca0ff8f95c824b47816a723d01c",
        "compact": "0x7f6e2a6fce8f54b25ef0f5dba37d6c4b1a063ce3c7afc0ee3ba6568619777fbbf5c4cdc54ecedf68a43775742f3fe5b956098ca0ff8f95c824b47816a723d01c"
    }, "nftOwnerSignature": {
        "r": "0xca7a2a7760cf9670e3db308380fb886665adfcaa56f4d972c435e4178ee72fec",
        "s": "0x69f1462599593d67eb842e26a27b92af966640a2bb335d07bca5946269243267",
        "_vs": "0x69f1462599593d67eb842e26a27b92af966640a2bb335d07bca5946269243267",
        "recoveryParam": 0,
        "v": 27,
        "yParityAndS": "0x69f1462599593d67eb842e26a27b92af966640a2bb335d07bca5946269243267",
        "compact": "0xca7a2a7760cf9670e3db308380fb886665adfcaa56f4d972c435e4178ee72fec69f1462599593d67eb842e26a27b92af966640a2bb335d07bca5946269243267"
    }
    }'
```

![image](https://user-images.githubusercontent.com/16574952/183394412-5d16ca38-4384-47be-9173-16e41dc29961.png)
![image](https://user-images.githubusercontent.com/16574952/183394541-fbd3598c-f924-45bc-953f-e096b89cb27f.png)

# QUALITY CONTROL

```shell
npm run test
npm run lint:ts -- --fix
npm run lint:sol
npm run format
```


# TODOS AND ROOM FOR IMPROVEMENTS: 

* handle ERC20 Token Transfers within MKT Contract Logic
* work with listings fees
* finish ut for settleTransaction function (it can be tested via postman though)
* add test coverage
* add full coverage smart contract ut
* further tests and deployments in Ropsten Network
* refactor controllers and services to reduce code lines per file and avoid cases of repeated code
* integrate Mongoose for more convenient data quering
