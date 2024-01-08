import { connection, closeDatabaseConnection } from "@dao-library/database";

/**
 * @param {string} daoAddress - The address of the DAO contract.
 * @param {string} daoURI - The DAO URI should conform to ERC-4824.
 * @param {string} version - The DAO version.
 * @returns {Promise<boolean>} - A promise that resolves to true if initialization is successful, false otherwise.
 */
async function initialize(daoAddress, daoURI, version) {
  return new Promise(async (resolve, reject) => {
    const db = connection();

    try {
      // Database action to insert DAO initialization data
      await new Promise((resolveInsert, rejectInsert) => {
        db.run(`INSERT INTO Dao (daoAddress, daoURI, version) VALUES (?, ?, ?)`, [daoAddress, daoURI, version], (err) => {
          if (err) {
            console.error(`Error in DAO insertion: ${err.message}`);
            rejectInsert(err);
          } else {
            resolveInsert();
          }
        });
      });

      // Resolve with true if the insertion is successful
      resolve(true);
    } catch (error) {
      console.error(`Error in initialize: ${error.message}`);

      // Reject with the error object for better error handling
      reject(error);
    } finally {
      // Close the database connection regardless of success or failure
      closeDatabaseConnection(db);
    }
  });
}


/**
 * @notice Sets the new [ERC-4824](https://eips.ethereum.org/EIPS/eip-4824) DAO URI and emits the associated event.
 * @param {string} daoURI - The new DAO URI.
 * @param {string} version - The DAO version.
 * @returns {Promise<boolean>} - A promise that resolves to true if DAO URI is updated successfully, false otherwise.
 */
async function setDaoURI(daoURI, version) {
  return new Promise((resolve, reject) => {
    const db = connection();

    // Database action to update DAO URI in the Dao table for a given version
    db.run(`UPDATE Dao SET daoURI = ? WHERE version = ?`, [daoURI, version], function (err) {
      try {
        if (err) {
          console.error(`Error in setDaoURI (UPDATE): ${err.message}`);
          reject(false);
        } else {
          console.log(`Updated Dao URI for version ${version}`);
          resolve(true);
        }
      } catch (error) {
        console.error(`Error in setDaoURI: ${error.message}`);
        reject(false);
      } finally {
        // Close the database connection regardless of success or failure
        closeDatabaseConnection(db);
      }
    });
  });
}

/// @notice Get the DAO URI
async function daoURI(version) {
  return new Promise((resolve, reject) => {
    let db = connection();

    try {
      // Database action to retrieve DAO URI from the Dao table
      db.get(`SELECT daoURI FROM Dao WHERE version = ?`, [version], (err, row) => {
        if (err) {
          reject(err);
        } else {
          closeDatabaseConnection(db);
          resolve(row ? row.daoURI : null);
        }
      });
    } catch (error) {
      console.error(`Error in daoURI: ${error.message}`);
      closeDatabaseConnection(db);
      reject(null);
    }
  });
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

export { daoURI, initialize, protocolVersion, setDaoURI };