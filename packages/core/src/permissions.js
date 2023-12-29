import { connection, closeDatabaseConnection } from "../../database/connection.js";

/// @notice Grants permission to an address to call methods with the specified permission identifier.
/// @dev Requires the `GRANT_PERMISSION_ID` permission.
/// @param where The target function/action for which `who` receives permission.
/// @param who The address receiving the permission.
/// @param permissionId The permission identifier.
function grant(where, who, permissionId) {

let db = connection();

try {
    // Database action to grant a permission to a member
    db.run(`INSERT INTO Permission (who, function, permissionId) VALUES (?, ?, ?)`, [who, where, permissionId]);
    closeDatabaseConnection(db);
    return true;
} catch (error) {
    console.error(`Error in grant: ${error.message}`);
    closeDatabaseConnection(db);
    return false;
}
}

/// @notice Grants permission to an address to call methods with the specified permission identifier if the referenced condition permits it.
/// @dev Requires the `GRANT_PERMISSION_ID` permission
/// @param where The target function for which `who` receives permission.
/// @param who The address receiving the permission.
/// @param permissionId The permission identifier.
/// @param condition The `PermissionCondition` that will be asked for authorization on calls connected to the specified permission identifier.
function grantWithCondition(where, who, permissionId, condition) {

let db = connection();

try {
    // Database action to grant a permission with a condition to a member
    db.run(`INSERT INTO Permission (who, function, permissionId) VALUES (?, ?, ?)`, [who, where, permissionId]);
    closeDatabaseConnection(db);
    return true;
} catch (error) {
    console.error(`Error in grantWithCondition: ${error.message}`);
    closeDatabaseConnection(db);
    return false;
}
}

/// @notice Revokes permission from an address to call methods in a target function with the specified permission identifier.
/// @dev Requires the `GRANT_PERMISSION_ID` permission.
/// @param where The target function for which `who` receives permission.
/// @param who The address receiving the permission.
function revoke(where, who, permissionId) {

let db = connection();

try {
    // Database action to revoke a permission from a member
    db.run(`DELETE FROM Permission WHERE who = ? AND function = ? AND permissionId = ?`, [who, where, permissionId]);
    closeDatabaseConnection(db);
    return true;
} catch (error) {
    console.error(`Error in revoke: ${error.message}`);
    closeDatabaseConnection(db);
    return false;
}
}


/// @notice Checks if the caller address has permission on the target contract via a permission identifier and relays the answer to a condition contract if this was declared during the granting process.
/// @param where The target function for which `who` receives permission.
/// @param who The address receiving the permission.
/// @param permissionId The permission identifier.
/// @param data Optional data to be passed to the set `PermissionCondition`.
/// @return Returns true if `who` has the permissions on the target contract via the specified permission identifier.
async function isGranted(where, who, permissionId, data) {
  let db = connection();

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

    closeDatabaseConnection(db);
    return result > 0;
  } catch (error) {
    console.error(`Error in isGranted: ${error.message}`);
    closeDatabaseConnection(db);
    return false;
  }
}

/// @notice Relays the question if caller address has permission on target contract via a permission identifier to a condition contract.
/// @notice Checks a condition contract
/// @param condition The condition contract that is called.
/// @param where The target function for which `who` receives permission.
/// @param who The address receiving the permission.
/// @param permissionId The permission identifier.
/// @param data Optional data to be passed to a referenced `PermissionCondition`.
/// @return Returns `true` if a caller (`who`) has the permissions on the contract (`where`) via the specified permission identifier.
/// @dev If the external call fails, we return `false`.
async function checkCondition(condition, where, who, permissionId, data) {
  let db = connection();

  try {
    // Database action to check a condition for a specific permission
    const result = await new Promise((resolve, reject) => {
      db.get(`SELECT COUNT(*) AS count FROM Permission WHERE who = ? AND function = ? AND permissionId = ?`, [who, where, permissionId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row.count : 0);
        }
      });
    });

    closeDatabaseConnection(db);
    return result > 0;
  } catch (error) {
    console.error(`Error in checkCondition: ${error.message}`);
    closeDatabaseConnection(db);
    return false;
  }
}

export { checkCondition, grant, grantWithCondition, isGranted, revoke };