import { connection, closeDatabaseConnection } from "@dao-library/database";

/**
 * Initialize the Token Manager and add 0xda0 member to the Members table.
 * @param {string} tokenName - The name of the token.
 * @param {string} tokenSymbol - The symbol of the token.
 * @param {number} initialSupply - The initial token supply.
 * @returns {Promise<boolean>} - A promise that resolves to true if initialization is successful, false otherwise.
 */
async function initializeTokenManager(tokenName, tokenSymbol, initialSupply) {
  return new Promise(async (resolve, reject) => {
    const db = connection();

    try {
      // Insert initial token details into the Token table
      await new Promise((resolveInsertToken, rejectInsertToken) => {
        db.run(
          `
          INSERT INTO Token (name, symbol, totalSupply)
          VALUES (?, ?, ?)
        `,
          [tokenName, tokenSymbol, initialSupply],
          (err) => {
            if (err) {
              rejectInsertToken(err);
            } else {
              resolveInsertToken();
            }
          }
        );
      });

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
        await new Promise((resolveInsertMember, rejectInsertMember) => {
          db.run(
            `
            INSERT INTO Members (address, balance)
            VALUES ('0xda0', ?)
          `,
            [initialSupply],
            (err) => {
              if (err) {
                rejectInsertMember(err);
              } else {
                resolveInsertMember();
              }
            }
          );
        });
      }

      resolve(true);
    } catch (error) {
      console.error(`Error in initializeTokenManager: ${error.message}`);
      reject(false);
    } finally {
      closeDatabaseConnection(db);
    }
  });
}


/**
 * @notice Mint tokens for `receiver`.
 * @param {string} receiver - The address receiving the tokens, cannot be the Token Manager itself (use `issue()` instead).
 * @param {number} amount - Number of tokens minted.
 * @returns {Promise<boolean>} - A promise that resolves to true if minting is successful, false otherwise.
 */
async function mint(receiver, amount) {
  return new Promise(async (resolve, reject) => {
    const db = connection();

    try {
      // Check if the receiver is the Token Manager
      if (receiver.toLowerCase() === "0xda0") {
        throw new Error("Cannot mint tokens directly to the Token Manager. Use 'issue()' instead.");
      }

      // Update the Token table with the minted amount
      await new Promise((resolveUpdateToken, rejectUpdateToken) => {
        db.run(`UPDATE Token SET totalSupply = totalSupply + ? `, [amount], (err) => {
          if (err) {
            rejectUpdateToken(err);
          } else {
            resolveUpdateToken();
          }
        });
      });

      // Update the receiver's balance in the Members table
      await updateBalance(receiver, amount); // Add to receiver's balance

      resolve(true);
    } catch (error) {
      console.error(`Error in mint: ${error.message}`);
      reject(false);
    } finally {
      closeDatabaseConnection(db);
    }
  });
}


/**
 * @notice Mint tokens for the Token Manager.
 * @param {number} amount - Number of tokens minted.
 * @returns {Promise<boolean>} - A promise that resolves to true if minting is successful, false otherwise.
 */
async function issue(amount) {
  return new Promise(async (resolve, reject) => {
    const db = connection();

    try {
      // Update the Token table with the minted amount
      await new Promise((resolveUpdateToken, rejectUpdateToken) => {
        db.run(`UPDATE Token SET totalSupply = totalSupply + ?`, [amount], (err) => {
          if (err) {
            rejectUpdateToken(err);
          } else {
            resolveUpdateToken();
          }
        });
      });

      // Update the Token Manager's balance in the Members table
      await updateBalance('0xda0', amount);

      resolve(true);
    } catch (error) {
      console.error(`Error in issue: ${error.message}`);
      reject(false);
    } finally {
      closeDatabaseConnection(db);
    }
  });
}

/**
 * Updates the balance for a specific address by adding or subtracting the specified amount.
 * @param {string} address - The address for which to update the balance.
 * @param {number} amount - The amount to add or subtract from the balance.
 * @returns {Promise<void>} - A promise that resolves when the update is completed.
 */
async function updateBalance(address, amount) {
  return new Promise(async (resolve, reject) => {
    const db = connection();

    try {
      await db.run(`UPDATE Members SET balance = balance + ? WHERE address = ?`, [amount, address]);
      resolve();
    } catch (error) {
      console.error(`Error updating balance for ${address}: ${error.message}`);
      reject(error);
    } finally {
      closeDatabaseConnection(db);
    }
  });
}

/**
 * Assigns tokens to `receiver` from the Token Manager's holdings.
 * @param {string} receiver - The address receiving the tokens.
 * @param {number} amount - Number of tokens transferred.
 * @returns {Promise<boolean>} - A promise that resolves to true if the assignment is successful, false otherwise.
 */
async function assign(receiver, amount) {
  return new Promise(async (resolve, reject) => {
    try {
      // Update the Token Manager's balance by subtracting the amount
      await updateBalance('0xda0', -amount);

      // Update the receiver's balance in the Members table by adding the amount
      await updateBalance(receiver, amount);

      resolve(true);
    } catch (error) {
      console.error(`Error in assignTokens: ${error.message}`);
      reject(false);
    }
  });
}

/**
 * Burns `amount` tokens from `holder`.
 * @param {string} holder - Holder of tokens being burned.
 * @param {number} amount - Number of tokens being burned.
 * @returns {Promise<boolean>} - A promise that resolves to true if the burning is successful, false otherwise.
 */
async function burn(holder, amount) {
  return new Promise(async (resolve, reject) => {
    const db = connection();

    try {
      // Update the Token table by reducing the total supply
      await db.run(`UPDATE Token SET totalSupply = totalSupply - ? `, [amount]);

      // Update the holder's balance in the Members table
      await db.run(`UPDATE Members SET balance = balance - ? WHERE address = ?`, [amount, holder]);

      resolve(true);
    } catch (error) {
      console.error(`Error in burn: ${error.message}`);
      reject(false);
    } finally {
      closeDatabaseConnection(db);
    }
  });
}

/**
 * Assigns `amount` tokens to `receiver` from the Token Manager's holdings with a revokable vesting starting at a given date.
 * @param {string} receiver - The address receiving the tokens, cannot be the Token Manager itself.
 * @param {number} amount - Number of tokens vested.
 * @param {string} start - Date the vesting calculations start.
 * @param {string} cliff - Date when the initial portion of tokens is transferable.
 * @param {string} vested - Date when all tokens are transferable.
 * @param {boolean} revokable - Whether the vesting can be revoked by the Token Manager.
 * @returns {Promise<void>} - A promise that resolves when the vesting is assigned.
 */
async function assignVested(receiver, amount, start, cliff, vested, revokable) {
  return new Promise(async (resolve, reject) => {
    const db = connection();

    try {
      await new Promise((resolveInsert, rejectInsert) => {
        db.run('INSERT INTO Vesting (VestingID, Amount, StartDate, CliffDate, VestedDate, Revokable) VALUES (?, ?, ?, ?, ?, ?)',
          [receiver, amount, start, cliff, vested, revokable], (err) => {
            if (err) {
              console.error(`Error in assignVested: ${err.message}`);
              rejectInsert(err);
            } else {
              resolveInsert();
            }
          });
      });
      resolve();
    } catch (error) {
      reject(error);
    } finally {
      closeDatabaseConnection(db);
    }
  });
}

/**
 * Revokes vesting from `holder`, returning unvested tokens to the Token Manager.
 * @param {string} holder - Address whose vesting to revoke.
 * @returns {Promise<void>} - A promise that resolves when the vesting is revoked.
 */
async function revokeVesting(holder) {
  return new Promise(async (resolve, reject) => {
    const db = connection();

    try {
      await new Promise((resolveUpdate, rejectUpdate) => {
        db.run('UPDATE Vesting SET Revoked = 1 WHERE VestingID = ?', [holder], (err) => {
          if (err) {
            console.error(`Error in revokeVesting (UPDATE): ${err.message}`);
            rejectUpdate(err);
          } else {
            resolveUpdate();
          }
        });
      });
      resolve();
    } catch (error) {
      reject(error);
    } finally {
      closeDatabaseConnection(db);
    }
  });
}

/**
 * Gets vesting details for a recipient and vesting ID.
 * @param {number} vestingId - ID of the vesting i.e the holder
 * @returns {Promise} - A promise that resolves to the vesting details.
 */
async function getVesting(vestingId) {
  const db = connection();

  try {
    const vestingRow = await new Promise((resolve, reject) => {
      // Get actions associated with the proposal
      db.all('SELECT * FROM Vesting WHERE VestingID = ?', [vestingId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    return vestingRow;
  } catch (error) {
    console.error(`Error in getVesting: ${error.message}`);
    throw error;
  } finally {
    closeDatabaseConnection(db);
  }
}

/**
 * Gets the spendable balance of a holder.
 * @param {string} holder - The address of the holder.
 * @returns {Promise<number>} - A promise that resolves to the spendable balance.
 */
async function spendableBalanceOf(holder) {
  return new Promise((resolve, reject) => {
    let db = connection();

    db.get('SELECT balance FROM Members WHERE address = ?', [holder], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.balance : 0);
      }
    });

    closeDatabaseConnection(db);
  });
}

/**
 * Gets the total supply of the token.
 * @returns {Promise<number|null>} - A promise that resolves to the total supply or null if an error occurs.
 */
async function totalSupply() {
  return new Promise((resolve, reject) => {
    const db = connection();

    db.get('SELECT totalSupply FROM Token', (err, result) => {

      if (err) {
        console.error(`Error in totalSupply: ${err.message}`);
        reject(err);
      } else {
        resolve(result ? result.totalSupply : null);
      }
    });

    closeDatabaseConnection(db);

  });
}

export { initializeTokenManager, assign, assignVested, burn, getVesting, issue, mint, revokeVesting, spendableBalanceOf, totalSupply };
