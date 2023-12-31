## Overview 
This project provides a Javascript libary to help developers build DAOs on Cartesi. 

The project adapted its design from some of the leading implementations in the Ethereum ecosystem ( see the reference section for more info)

## Design
The core architecture has been adapted from [Aragon OSX](https://github.com/aragon/osx/tree/develop/packages/contracts/src). Aragon OSX is a DAO framework. Even though you're unfamiliar with Aragon, we will explain the concepts being used here.

Let's begin with the basics. A DAO is simply a governance structure composed of members with certain roles. These roles are defined by what **functions** a member can call. For example, a token-holder can vote or propose changes, and a **trusted delegate(s)** can execute actions on behalf of the DAO. With this in mind, we can look at a DAO as a **permission** manager. 

We can implement a DAO’s actions through **plugins**. This includes mechanisms for voting, treasury management, governance, or even integrations. Generally, whatever feature you would like to add to your basic DAO.

This modular design allows the DAO logic to be easily changed by installing, upgrading, or removing a plugin. For example, to change from a 1:1 voting to a quadratic voting system, all you need to do is modify the voting plugin. 

From the above statements, we have our DAO library as below:

1. Core library
- `@dao-library/core/dao` - functions that manage setting up the DAO 
- `@dao-library/core/permission`- functions that manage permissions
- `@dao-library/core/proposal`- functions that handle proposals

2. Plugins

- `@dao-library/voting`- functions that manage voting
- `@dao-library/treasury`- functions that relate to the DAO's finances

Please check the API docs in root dir: `API-core.md` and `API-plugins.md`

## Usage

See the README in the **example** directory.

## References

1. [ERC-4824: Common Interfaces for DAOs](https://eips.ethereum.org/EIPS/eip-4824#membersuri)
2. [ERC-1202: Voting Interface](https://eips.ethereum.org/EIPS/eip-1202)
3. [Aragon OSx](https://github.com/aragon/osx/tree/develop/packages/contracts/src)
