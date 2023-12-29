import { connection, closeDatabaseConnection } from "../../database/connection.js";

/// @param daoAddress The address of the DAO contract
/// @param daoURI The DAO URI should confirm to [ERC-4824](https://eips.ethereum.org/EIPS/eip-4824).
function initialize(daoAddress, daoURI, version) {

    let db = connection();

    try {
      // Database action to insert DAO initialization data
      db.run(`INSERT INTO Dao (daoAddress, daoURI, version) VALUES (?, ?, ?)`, [daoAddress, daoURI, version]);
      
      // close the database connection
      closeDatabaseConnection(db);

      return true;
    } catch (error) {
      console.error(`Error in initialize: ${error.message}`);

      // close the database connection
      closeDatabaseConnection(db);
      return false;
    }
  }

/// @notice Sets the new [ERC-4824](https://eips.ethereum.org/EIPS/eip-4824) DAO URI and emits the associated event.
/// @param daoURI The new DAO URI.
function setDaoURI(daoURI, version) {

  let db = connection();

  try {
    // Database action to update DAO URI in the Dao table for a given version
    db.run(`UPDATE Dao SET daoURI = ? WHERE version = ?`, [daoURI, version], function (err) {
      if (err) {
        console.error(`Error in setDaoURI (UPDATE): ${err.message}`);
        closeDatabaseConnection(db);
        return false;
      } else {
        console.log(`Updated Dao URI for version ${version}`);
        closeDatabaseConnection(db);
        return true;
      }
    });
  } catch (error) {
    console.error(`Error in setDaoURI: ${error.message}`);
    closeDatabaseConnection(db);
    return false;
  }
}

/// @notice Get the DAO URI
async function daoURI(version) {
  let db = connection();

  try {
    // Database action to retrieve DAO URI from the Dao table
    let uri = await new Promise((resolve, reject) => {
      db.get(`SELECT daoURI FROM Dao WHERE version = ?`, [version], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row.daoURI : null);
        }
      });
    });

    closeDatabaseConnection(db);
    return uri;
  } catch (error) {
    console.error(`Error in daoURI: ${error.message}`);
    closeDatabaseConnection(db);
    return null;
  }
}

/// @notice Provides the current DAO version. This is important in case of upgradeable DAOs
async function protocolVersion() {
  let db = connection();

  try {
    // Database action to retrieve the latest protocol version from the Dao table
    let version = await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM Dao ORDER BY version DESC LIMIT 1`, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row.version : null);
        }
      });
    });

    closeDatabaseConnection(db);
    return version;
  } catch (error) {
    console.error(`Error in protocolVersion: ${error.message}`);
    closeDatabaseConnection(db);
    return null;
  }
}

/// @notice Checks if an address has permission on a contract via a permission identifier.
/// @param where The function to be accessed
/// @param who The address to give the permissions.
/// @param permissionId The permission identifier.
/// @param data The optional data passed to the `PermissionCondition` registered.
/// A permission condition can be something such as: address has balance greater than
/// OR address has participated in n number of proposals, showing that they are an active community memeber
/// @return Returns true if the address has permission, false if not.
function hasPermission(where, who, permissionID, data) {

  let db = connection();

  try {
    // Database action to check if a member has a specific permission
    const result = db.get(`SELECT COUNT(*) AS count FROM Permission WHERE who = ? AND function = ? AND permissionID = ?`, [who, where, permissionID]);
    closeDatabaseConnection(db);
    return result.count > 0;
  } catch (error) {
    console.error(`Error in hasPermission: ${error.message}`);
    closeDatabaseConnection(db);
    return false;
  }
}

export { daoURI, hasPermission, initialize, protocolVersion, setDaoURI };