# API Library 

As mentioned earlier, we describe an API using (1) **its function name** and (2) the its **parameter list** (in the order given in the function signature). Please revisit the section **Interacting with the DApp** to know how call an endpoint.

Below is the list of the core API endpoints. 

## DAO 

-------------
**action**: `initialize`

**params**

`daoAddress` The address of the DAO contract  
`daoURI` The DAO URI should confirm to [ERC-4824](https://eips.ethereum.org/EIPS/eip-4824).

**returns**:

`null` if not yet set, `true` otherwise

----------------

**action**: `setDaoURI`

**params**  
`daoURI` The new DAO URI.  
`version` The DAO version for which to change the URI

**description** Sets the new [ERC-4824](https://eips.ethereum.org/EIPS/eip-4824) DAO URI 

-------------------

**action** `daoURI`

**params** `version` Version of the DAO 

**description** Gets the DAO URI for a given version

------------

**action** `protocolVersion`

**params** NONE

**description** Provides the current DAO version.

## Permissions 

**action**: `hasPermission`

**params**

- `where` The function (action) to be accessed.
- `who` The address to give the permissions.
- `permissionId` The permission identifier.

**description**

Checks if an address has permission via a permission identifier.

**returns**

`true` if the address has permission, `false` if not.

-------------

**action**: `grant`

**params**

`where` The target function/action for which `who` receives permission.  
`who` The address receiving the permission.  
`permissionId` The permission identifier.

**description**

Grants permission to an address to call actions with the specified permission identifier.

-------------

**action**: `revoke`

**params**

- `where` : The target function for which `who` receives permission.
- `who` : The address receiving the permission.
- `permissionId` : The permission identifier.

**description**

Revokes permission from an address to call a target function 

## Proposals

**action**: `proposalCount`

**params**

`proposalId` - The unique identifier of the proposal.

**description** Resolves the count of proposals in the database.

-------------

**action**: `createProposal`

**params**

`proposer` - The address of the proposer submitting the proposal.  
`metadata` - Metadata object containing information about the proposal (i.e, `title` and `description`).  
`startDate` - The start date of the proposal.  
`endDate` - The end date of the proposal.    
`actions` - An array of action objects representing the steps to be executed if the proposal is approved.  

**description** Creates a new proposal

**returns**

The ID of the newly created proposal.

-------------

**action**: `getActionObject`

**params**: 

`proposalID` The unique identifier of the proposal to be executed.

**returns** - A promise that resolves to an array of action objects.

------------

**action** `proposalExists`

**params**:

`proposalId`- The unique identifier of the proposal.

**description**: Checks whether the proposal with the specified ID exists.

**returns**

- `true` if it exists
- `false` if NOT