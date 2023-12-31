import { connection, closeDatabaseConnection } from "@dao-library/database";

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


/// @notice Checks if the caller address has permission on the target function
/// @param where The target function
/// @param who The address to check for the permission.
/// @param permissionId The permission identifier.
/// @return Returns true if `who` has the permissions on the target function via the specified permission identifier.
async function hasPermission(where, who, permissionId) {
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

export { hasPermission, grant, revoke };