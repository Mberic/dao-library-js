## Overview

Let's see an example on how we can use the DAO library. We will be creating a multisig DAO. 

**Note**: Remember to check out the recap section at the end to see the steps on how to build everything from scratch

## Set-Up
First, install `sunodo`. Sunodo is a CLI tool for Cartesi that eases the work of building, running, and interacting with your Cartesi DApps. 

Please install the version below (other versions may behave differently):

```
npm install -g @sunodo/cli@0.10.2
```

You can read more about sunodo commands from [here](https://docs.sunodo.io/guide/introduction/what-is-sunodo)

Ensure that you have pnpm installed. If not, refer to this documenation on how to install.

### Install Dependencies

Clone this repo & then navigate to the root of our example i.e. `example/`. Run the comamnd below:

pnpm install

This will install node modules in all sub-directories. Please ensure that your `pnpm` is configured to do recursive installations (this is the default).

## Building the DApp 

All our application logic is in the `src/index.js` file. This file is your application's entry point and it's where you will include the API endpoints that your DApp will expose.

A little about this file: 

In this file, we have two methods of particular interest to us: 

- `action_proxy`- all actions (functions) that advance the state of our DApp are handled here. 

- `inspect_proxy` - handles actions that request some information without, modifying the state of the DApp 

### Interacting with the DApp 
Let's first discuss the data format we use for interaction. Each request to advance the DApp state is sent as a JSON string with the following format:

```
{ "action": "methodName", "params": [ ] }
```
**NOTE**: Ensure that you're using straight quotes and not curved quotes. Otherwise, you'll get a parsing error.

The `action` field contains the function identifier. The `params` field contains all the arguments of a given function, in the order of its function signature.

For interactions that inspect the DApp, we make an HTTP call in the link format below:

```
http://127.0.0.1:8080/inspect/action

```
## Running the DApp 

Finally, let's see some things in action. Build the DApp's docker image using (ensure that you have Docker running):

```
# run this from the project root i.e example/
sunodo build
```

Next, run the DApp. For testing purposes, it's good to first run the backend on the host machine before running it in a node. To achieve this, run the DApp with the `--no-backend` flag on sunodo:

```
sunodo run --no-backend
```

Next set the HTTP server env variable (this is used by `index.js`):

```
export ROLLUP_HTTP_SERVER_URL=http://127.0.0.1:8080/host-runner
```

Now open a new terminal window and run the `index.js` file.

```
node src/index.js

```
Once again, open a new terminal window (this is the 3rd one). In this window, is where we will be interacting with our DApp (i.e. sending inputs ). Run the command below:

```
sunodo send generic 
```

Your selection should be as follows:

```
? Chain Foundry
? RPC URL http://127.0.0.1:8545
? Wallet Mnemonic
? Mnemonic test test test test test test test test test test test junk
? Account 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 9999.969241350387558666 ETH
? DApp address (0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C)
? Input String encoding
```

In the input field, enter: 

```
{ "action": "initialize", "params": ["0xda0", "dao.eth", 1.05] }
```
See the sample image below (on the terminal running sunodo send generic ):

![sunodo-send-generic](https://github.com/Mberic/dao-template-cartesi/assets/51446308/4fb64b0e-8dc0-40c0-89c8-c1111f77af72)

On the terminal running index.js, you should have an output similar to:

![indexJS-terminal](https://github.com/Mberic/dao-template-cartesi/assets/51446308/eabf3815-5e25-4a50-8cae-029e99d2de0b)

To know whether everything is running as it should, you can check the dao.db file to know if the input reached:

```
sqlite3 src/core/database/dao.db
```
Inside the SQLite terminal run, **SELECT * FROM Dao**;

Viola! You should be able to see the input. Now, try the same for other actions.

Here is a sample inspect HTTP call:

```
curl -i http://localhost:8080/inspect/protocol-version
```
Result:

![protocol-version](https://github.com/Mberic/dao-template-cartesi/assets/51446308/76764fa2-8a65-4637-99d0-d0c8582642a1)

### More Interactions

At the beginning, we said that we were going to see how we can build a custom DAO (multisig DAO) using our Javascript library. We have so far done the first operation of our DAO i.e initializing `"action": "initialize"`.

Next, we are going to create a proposal `createProposal`, vote for it `approve`, and then finally `execute` it.

1. Create a proposal to add a new member. Use `sunodo` as shown earlier. Please use this account in your `sunodo` selection: `Account 0xf39Fd...266` for all the DApp inputs below.

```json
{
  "action": "createProposal",
  "params": [
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    { "title": "add address", "description": "new member" },
    { "action": "addAddresses", "params": ["0x70997970C51812dc3A010C7d01b50e0d17dc79C8"] },
    "20-Mar-2023",
    "20-June-2023",
    0
  ]
}
```
2. Approve (i.e vote) for the proposal:

```json
{ "action": "approve", "params": ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "6b9f0493b96b8731e6e9d302cdb7b0e567f381b49df02e78f0abab73d33b60e1"] }
```

Note: 6b9f...b60e1 is the sha256 hash of `add address`. `ProposalID` fields in the database are stored as the sha256 hash of the unique proposal title.

3. Execute the proposal

```json
{ "action": "execute", "params": ["6b9f0493b96b8731e6e9d302cdb7b0e567f381b49df02e78f0abab73d33b60e1"] }
```

This example aimed to demonstrate how you can get started with using the framework. The part of creative expression is left to you. Here are some DAOs you can take inspiration from:

- [Giveth Dao](https://giveth.io/)
- [Moloch Dao](https://molochdao.com/)