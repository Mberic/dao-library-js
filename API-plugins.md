## Plugins

Please note that you can also a contribute to add onto the plugin library.

### Membership

**description** Checks if a given address is a member.

**param {string}** `address` - The address to check for membership.

**returns**

 - A promise that resolves to `true` if the address is a member, `false` otherwise.

### Voting

## Majority Voting

**action** `supportThreshold`

**description** Returns the support threshold parameter stored in the voting settings.

**returns** {number|null} - The support threshold parameter.

-----------------

**action** `minParticipation`

**description** Returns the minimum participation parameter stored in the voting settings.

**returns** {number|null} - The minimum participation parameter.
 
 ---------------
 
**action** `isSupportThresholdReached`(proposalId)

**params** 

`proposalId` - The ID of the proposal.

**description** Checks if the support value defined for a proposal vote is greater than the support threshold.

**return {boolean}** - Returns `true` if the support is greater than the support threshold and `false` otherwise.

---------------

**action** `isMinParticipationReached`

**params**  

`proposalId` - The ID of the proposal.

**description** Checks if the participation value defined for a proposal vote is greater or equal than the minimum participation value.

**return {boolean}** - Returns `true` if the participation is greater than the minimum participation and `false` otherwise.

----------------------

**action**: `getVoteOption`

**params**

`proposalId` - The ID of the proposal.
`account` - The account address to be checked.

**description** Returns whether the account has voted for the proposal.

**returns {string|null}** - The vote option cast by a voter for a certain proposal.

----------------

**action** `vote`

**params**

`voter` - The voter address/ID.
`proposalId` - The ID of the proposal.
`voteOption` - The chosen vote option.

**description** Cast vote for a vote option.

--------------------

**action** `setMinParticipation`

**params**
`minParticipation` - The new minimum participation value.

**description** Set the minimum participation in the voting settings.

**returns** A promise that resolves to `true` if the operation is successful, `false` otherwise.

--------------------

**action** `setSupportThreshold`

**description** Set the support threshold in the voting settings.

**params**
`supportThreshold` - The new support threshold value.

**returns** A promise that resolves to `true` if the operation is successful, false otherwise.
 
## Multisig Voting

**action** `addAddresses`

**params** 

`member` - The address of the member to be added.

**description** Adds new members to the address list.

**returns {boolean}** - True if the member was successfully added, false otherwise.

----------------

**action** `removeAddresses`

**params**

`member` - The address of the member to be removed.

**description** Removes existing members from the address list.

**returns {boolean}**  - True if the member was successfully removed, false otherwise.

-------------------------
**action** `approve`

**params**
 
`voter` - The address/ID of the voter.
`proposalId` - The ID of the proposal.

**returns {boolean}** - True if the approval was successful, false otherwise.

**description** Approves the proposal.

### Treasury

#### Token Manager

**action**: `mint`

**params**:

- `receiver` The address receiving the tokens, cannot be the Token Manager itself (use `issue()` instead)
- `amount` Number of tokens minted

---------

**action**: `issue`

**params**:

- `amount` Number of tokens minted

**description** Mint tokens for the Token Manager

---------

**action**: `assign`

**params**:

- `receiver` The address receiving the tokens
- `amount` Number of tokens transferred

**description**: Assign tokens to `receiver` from the Token Manager's holdings

---------
**action**: `burn`

**params**:

- `holder` Holder of tokens being burned
- `amount` Number of tokens being burned

**description**: Burn ` amount` tokens from `holder`

--------

**action**: `assignVested`

**params**:

- `receiver` The address receiving the tokens, cannot be Token Manager itself
- `amount` Number of tokens vested
- `start` Date the vesting calculations start
- `cliff` Date when the initial portion of tokens are transferable
- `vested` Date when all tokens are transferable
- `revokable` Whether the vesting can be revoked by the Token Manager

**description**: Assign `amount` tokens to `receiver` from the Token Manager's holdings with a revokable vesting starting at given date

-------

**action**: `revokeVesting`

**params**:
- `holder` Address whose vesting to revoke
- `vestingId` Numeric ID of the vesting

**description**: Revoke vesting `vestingId` from `holder`, returning unvested tokens to the Token Manager

---------------

**action** `getVesting`

**params**

`recipient` - The address of the recipient.
`vestingId` - Numeric ID of the vesting.

**description** Gets vesting details for a recipient and vesting ID.

**returns** - A promise that resolves to the vesting details.

------------------

**action** `spendableBalanceOf`

**params**
`holder` - The address of the holder.

**description** Gets the spendable balance of a holder.

**returns** - A promise that resolves to the spendable balance.