## Plugins

Please note that you can contribute to add on to the plugin library.

### Voting

## Majority Voting

## Multisig Voting

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

**action**: assignVested

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

#### Vault

**action**: `deposit` review???
* @notice Deposit `value` `token` to the vault
 * @param token Address of the token being transferred
 * @param value Amount of tokens being transferred
