import { connection, closeDatabaseConnection } from "../../database/connection";

/**
 * @notice Mint tokens for `receiver`.
 * @param {string} receiver - The address receiving the tokens, cannot be the Token Manager itself (use `issue()` instead).
 * @param {number} amount - Number of tokens minted.
 */
function mint(receiver, amount) {
  let db = connection();

  try {
    db.run('INSERT INTO Treasury (SenderAddress, ReceiverAddress, Amount, Purpose) VALUES (?, ?, ?, ?)', ['Token Manager', receiver, amount, 'Mint']);
  } catch (error) {
    console.error(`Error in mint: ${error.message}`);
  } finally {
    closeDatabaseConnection(db);
  }
}

/**
 * @notice Mint tokens for the Token Manager.
 * @param {number} amount - Number of tokens minted.
 */
function issue(amount) {
  let db = connection();

  try {
    db.run('INSERT INTO Treasury (SenderAddress, ReceiverAddress, Amount, Purpose) VALUES (?, ?, ?, ?)', ['Token Manager', 'Token Manager', amount, 'Issue']);
  } catch (error) {
    console.error(`Error in issue: ${error.message}`);
  } finally {
    closeDatabaseConnection(db);
  }
}

/**
 * @notice Assign tokens to `receiver` from the Token Manager's holdings.
 * @param {string} receiver - The address receiving the tokens.
 * @param {number} amount - Number of tokens transferred.
 */
function assign(receiver, amount) {
  let db = connection();

  try {
    db.run('INSERT INTO Treasury (SenderAddress, ReceiverAddress, Amount, Purpose) VALUES (?, ?, ?, ?)', ['Token Manager', receiver, amount, 'Assign']);
  } catch (error) {
    console.error(`Error in assign: ${error.message}`);
  } finally {
    closeDatabaseConnection(db);
  }
}

/**
 * @notice Burn `amount` tokens from `holder`.
 * @param {string} holder - Holder of tokens being burned.
 * @param {number} amount - Number of tokens being burned.
 */
function burn(holder, amount) {
  let db = connection();

  try {
    db.run('INSERT INTO Treasury (SenderAddress, ReceiverAddress, Amount, Purpose) VALUES (?, ?, ?, ?)', [holder, 'Burned Tokens', amount, 'Burn']);
  } catch (error) {
    console.error(`Error in burn: ${error.message}`);
  } finally {
    closeDatabaseConnection(db);
  }
}

/**
 * @notice Assign `amount` tokens to `receiver` from the Token Manager's holdings with a revokable vesting starting at given date.
 * @param {string} receiver - The address receiving the tokens, cannot be Token Manager itself.
 * @param {number} amount - Number of tokens vested.
 * @param {string} start - Date the vesting calculations start.
 * @param {string} cliff - Date when the initial portion of tokens is transferable.
 * @param {string} vested - Date when all tokens are transferable.
 * @param {boolean} revokable - Whether the vesting can be revoked by the Token Manager.
 */
function assignVested(receiver, amount, start, cliff, vested, revokable) {
  let db = connection();

  try {
    db.run('INSERT INTO Vesting (HolderAddress, Amount, StartDate, CliffDate, VestedDate, Revokable) VALUES (?, ?, ?, ?, ?, ?)',
      [receiver, amount, start, cliff, vested, revokable]);
  } catch (error) {
    console.error(`Error in assignVested: ${error.message}`);
  } finally {
    closeDatabaseConnection(db);
  }
}

/**
 * @notice Revoke vesting `vestingId` from `holder`, returning unvested tokens to the Token Manager.
 * @param {string} holder - Address whose vesting to revoke.
 * @param {number} vestingId - Numeric ID of the vesting.
 */
function revokeVesting(holder, vestingId) {
  let db = connection();

  try {
    db.run('UPDATE Vesting SET Revoked = 1 WHERE VestingID = ? AND HolderAddress = ?', [vestingId, holder]);
  } catch (error) {
    console.error(`Error in revokeVesting: ${error.message}`);
  } finally {
    closeDatabaseConnection(db);
  }
}

/**
 * Gets vesting details for a recipient and vesting ID.
 * @param {string} recipient - The address of the recipient.
 * @param {number} vestingId - Numeric ID of the vesting.
 * @returns {Promise} - A promise that resolves to the vesting details.
 */
function getVesting(recipient, vestingId) {
  return new Promise((resolve, reject) => {
    let db = connection();

    db.get('SELECT * FROM Vesting WHERE HolderAddress = ? AND VestingID = ?', [recipient, vestingId], (err, row) => {
      closeDatabaseConnection(db);

      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

/**
 * Gets the spendable balance of a holder.
 * @param {string} holder - The address of the holder.
 * @returns {Promise} - A promise that resolves to the spendable balance.
 */
function spendableBalanceOf(holder) {
  return new Promise((resolve, reject) => {
    let db = connection();

    db.get('SELECT balance FROM Members WHERE address = ?', [holder], (err, row) => {
      closeDatabaseConnection(db);

      if (err) {
        reject(err);
      } else {
        resolve(row ? row.balance : 0);
      }
    });
  });
}

export { assign, assignVested, burn, getVesting, issue, mint, revokeVesting, spendableBalanceOf };
