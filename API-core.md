# API Library 

As mentioned earlier, we describe an API using (1) **its function name** and (2) the its **parameter list** (in the order given in the function signature). Please revisit the section **Interacting with the DApp** to know how call an endpoint.

Below is the list of the core API endpoints. Please check the corresponding files to see the description of the input parameters. 

## Core

### DAO 

-------------
**action**: `initialize`

**params**

- `daoAddress` (String): The address of the DAO contract
- `daoURI` (String): The DAO URI should confirm to [ERC-4824](https://eips.ethereum.org/EIPS/eip-4824).

### Permissions 

-------------
**action**: `hasPermission`

**params**

- `where` : The function (action) to be accessed.
- `who` : The address to give the permissions.
- `permissionId` : The permission identifier.
- `data` (Type: Any, optional): The optional data passed to the `PermissionCondition` registered. A permission condition can be something such as: an address has a balance greater than OR an address has participated in n number of proposals, showing that they are an active community member.

**description**

Checks if an address has permission on a contract via a permission identifier.

**returns**

- Type: Boolean
- Returns true if the address has permission, false if not.


-------------
**action**: `grant`

**params**

- `where` : The target function/action for which `who` receives permission.
- `who` : The address receiving the permission.
- `permissionId` : The permission identifier.

**description**

Grants permission to an address to call methods with the specified permission identifier.

-------------

**action**: `grantWithCondition`

**params**

- `where` : The target function for which `who` receives permission.
- `who` : The address receiving the permission.
- `permissionId` : The permission identifier.
- `condition` : The `PermissionCondition` that will be asked for authorization on calls connected to the specified permission identifier.

**description**

Grants permission to an address to call methods with the specified permission identifier if the referenced condition permits it.

-------------

**action**: `revoke`

**params**

- `where` : The target function for which `who` receives permission.
- `who` : The address receiving the permission.
- `permissionId` : The permission identifier.

**description**

Revokes permission from an address to call methods in a target function with the specified permission identifier.

-------------
**action**: `isGranted`

**params**

- `where` : The target function for which `who` receives permission.
- `who` : The address receiving the permission.
- `permissionId` : The permission identifier.
- `data` (Type: Any, optional): Optional data to be passed to the set `PermissionCondition`.

**description**

Checks if the caller address has permission on the target contract via a permission identifier and relays the answer to a condition contract if this was declared during the granting process.

**returns**

- Type: Boolean
- Returns true if `who` has the permissions on the target contract via the specified permission identifier.

-------------

**action**: `checkCondition`

**params**

- `condition` : The condition contract that is called.
- `where` : The target function for which `who` receives permission.
- `who` : The address receiving the permission.
- `permissionId` : The permission identifier.
- `data` (Type: Any, optional): Optional data to be passed to a referenced `PermissionCondition`.

**description**

Relays the question if the caller address has permission on the target contract via a permission identifier to a condition contract. Checks a condition contract.

**returns**

- Type: Boolean
- Returns `true` if a caller (`who`) has the permissions on the contract (`where`) via the specified permission identifier. If the external call fails, returns `false`.

### Proposals

**action**: `proposalExists`

**params**

- `proposalId`` - The unique identifier of the proposal.

**description** Resolves with the count of proposals in the database.

-------------

**action**: createProposal

**params**

`proposer` - The address of the proposer submitting the proposal.
`metadata` - Metadata object containing information about the proposal (e.g., title, description).
`startDate` - The start date of the proposal.
`endDate` - The end date of the proposal.
`actions` - An array of action objects representing the steps to be executed if the proposal is approved.
`allowFailureMap` - An object mapping action indices to boolean values indicating whether failure is allowed for each action.

**returns**

- The ID of the newly created proposal.

-------------

**action**: executeProposal

**params**: - The unique identifier of the proposal to be executed.