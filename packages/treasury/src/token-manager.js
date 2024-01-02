import { connection, closeDatabaseConnection } from "@dao-library/database";

/**
 * Initialize the Token Manager and add 0xda0 member to the Members table.
 * @param {string} tokenName - The name of the token.
 * @param {string} tokenSymbol - The symbol of the token.
 * @param {number} initialSupply - The initial token supply.
 */
async function initializeTokenManager(tokenName, tokenSymbol, initialSupply) {
  const db = connection();

  try {
    // Insert initial token details into the Token table
    await db.run(`
      INSERT INTO Token (name, symbol, totalSupply)
      VALUES (?, ?, ?)
    `, [tokenName, tokenSymbol, initialSupply]);

    // Check if the 0xda0 member already exists in the Members table
    const memberExists = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) AS count FROM Members WHERE address = ?', ['0xda0'], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count > 0);
        }
      });
    });

    // If the 0xda0 member doesn't exist, add it to the Members table
    if (!memberExists) {
      await db.run(`
        INSERT INTO Members (address, balance)
        VALUES ('0xda0', ?)
      `, [initialSupply]);
    }

    return true;
  } catch (error) {
    console.error(`Error in initializeTokenManager: ${error.message}`);
    return false;
  } finally {
    closeDatabaseConnection(db);
  }
}

/**
 * @notice Mint tokens for `receiver`.
 * @param {string} receiver - The address receiving the tokens, cannot be the Token Manager itself (use `issue()` instead).
 * @param {number} amount - Number of tokens minted.
 */
async function mint(receiver, amount) {
  const db = connection();

  try {
    // Check if the receiver is the Token Manager
    if (receiver.toLowerCase() === "0xda0") {
      throw new Error("Cannot mint tokens directly to the Token Manager. Use 'issue()' instead.");
    }

    // Update the Token table with the minted amount
    await db.run(`UPDATE Token SET totalSupply = totalSupply + ? `, [amount]);

    // Update the receiver's balance in the Members table
    await db.run(`UPDATE Members SET balance = balance + ? WHERE address = ?`, [amount, receiver]);

    return true;
  } catch (error) {
    console.error(`Error in mint: ${error.message}`);
    return false;
  } finally {
    closeDatabaseConnection(db);
  }
}

/**
 * @notice Mint tokens for the Token Manager.
 * @param {number} amount - Number of tokens minted.
 */
async function issue(amount) {
  const db = connection();

  try {
    // Update the Token table with the minted amount
    await db.run(`UPDATE Token SET totalSupply = totalSupply + ? `, [amount]);

    // Update the Token Manager's balance in the Members table
    await db.run(`UPDATE Members SET balance = balance + ? WHERE address = '0xda0'`, [amount]);

    return true;
  } catch (error) {
    console.error(`Error in issue: ${error.message}`);
    return false;
  } finally {
    closeDatabaseConnection(db);
  }
}

/**
 * @notice Assign tokens to `receiver` from the Token Manager's holdings.
 * @param {string} receiver - The address receiving the tokens.
 * @param {number} amount - Number of tokens transferred.
 */
async function assign(receiver, amount) {
  const db = connection();

  try {

    // Update the Token Manager's balance in the Members table
    await db.run(`UPDATE Members SET balance = balance - ? WHERE address = '0xda0'`, [amount]);

    // Update the receiver's balance in the Members table
    await db.run(`UPDATE Members SET balance = balance + ? WHERE address = ?`, [amount, receiver]);

    return true;
  } catch (error) {
    console.error(`Error in assign: ${error.message}`);
    return false;
  } finally {
    closeDatabaseConnection(db);
  }
}

/**
 * @notice Burn `amount` tokens from `holder`.
 * @param {string} holder - Holder of tokens being burned.
 * @param {number} amount - Number of tokens being burned.
 */
async function burn(holder, amount) {
  const db = connection();

  try {
    // Update the Token table by reducing the total supply
    await db.run(`UPDATE Token SET totalSupply = totalSupply - ? `, [amount]);

    // Update the holder's balance in the Members table
    await db.run(`UPDATE Members SET balance = balance - ? WHERE address = ?`, [amount, holder]);

    return true;
  } catch (error) {
    console.error(`Error in burn: ${error.message}`);
    return false;
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

export { initializeTokenManager, assign, assignVested, burn, getVesting, issue, mint, revokeVesting, spendableBalanceOf };
