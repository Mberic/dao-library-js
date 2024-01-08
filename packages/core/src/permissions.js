import { connection, closeDatabaseConnection } from "@dao-library/database";

/**
 * @notice Grants permission to an address to call methods with the specified permission identifier.
 * @dev Requires the `GRANT_PERMISSION_ID` permission.
 * @param {string} where - The target function/action for which `who` receives permission.
 * @param {string} who - The address receiving the permission.
 * @param {string} permissionId - The permission identifier.
 * @returns {Promise<boolean>} - A promise that resolves to true if permission is granted successfully, false otherwise.
 */
async function grant(where, who, permissionId) {
  const db = connection();

  try {
    // Database action to grant a permission to a member
    await new Promise((resolve, reject) => {
      db.run(`INSERT INTO Permission (who, function, permissionId) VALUES (?, ?, ?)`, [who, where, permissionId], (err) => {
        if (err) {
          console.error(`Error in grant: ${err.message}`);
          reject(false);
        } else {
          resolve(true);
        }
      });
    });

    return true;
  } catch (error) {
    console.error(`Error in grant: ${error.message}`);
    return false;
  } finally {
    // Close the database connection
    closeDatabaseConnection(db);
  }
}


/**
 * @notice Revokes permission from an address to call methods in a target function with the specified permission identifier.
 * @dev Requires the `GRANT_PERMISSION_ID` permission.
 * @param {string} where - The target function for which `who` receives permission.
 * @param {string} who - The address receiving the permission.
 * @param {string} permissionId - The permission identifier.
 * @returns {Promise<boolean>} - A promise that resolves to true if permission is revoked successfully, false otherwise.
 */
async function revoke(where, who, permissionId) {
  const db = connection();

  try {
    // Database action to revoke a permission from a member
    await new Promise((resolve, reject) => {
      db.run(`DELETE FROM Permission WHERE who = ? AND function = ? AND permissionId = ?`, [who, where, permissionId], (err) => {
        if (err) {
          console.error(`Error in revoke: ${err.message}`);
          reject(false);
        } else {
          resolve(true);
        }
      });
    });

    return true;
  } catch (error) {
    console.error(`Error in revoke: ${error.message}`);
    return false;
  } finally {
    // Close the database connection
    closeDatabaseConnection(db);
  }
}

/**
 * @notice Checks if the caller address has permission on the target function.
 * @param {string} where - The target function.
 * @param {string} who - The address to check for the permission.
 * @param {string} permissionId - The permission identifier.
 * @returns {Promise<boolean>} - A promise that resolves to true if `who` has the permissions on the target function via the specified permission identifier.
 */
async function hasPermission(where, who, permissionId) {
  const db = connection();

  try {
    // Database action to check if a member has a specific permission
    const result = await new Promise((resolve, reject) => {
      db.get(`SELECT COUNT(*) AS count FROM Permission WHERE who = ? AND function = ? AND permissionId = ?`, [who, where, permissionId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row.count : 0);
        }
      });
    });

    return result > 0;
  } catch (error) {
    console.error(`Error in hasPermission: ${error.message}`);
    return false;
  } finally {
    // Close the database connection
    closeDatabaseConnection(db);
  }
}

export { hasPermission, grant, revoke };