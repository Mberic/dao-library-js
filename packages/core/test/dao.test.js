import { describe, it, beforeEach, test } from 'mocha';
import assert from 'assert';

import { initialize, setDaoURI, daoURI, protocolVersion } from "../src/dao.js";
import { connection, closeDatabaseConnection } from '../../database/connection.js';

describe('Dao functions', () => {

  beforeEach(async () => {
    // Reset the database before each test
    const db = connection();
    await db.exec('PRAGMA foreign_keys = OFF'); // Disable foreign key constraints for testing
    await db.exec('BEGIN TRANSACTION');
    await resetDatabase();
  });

test("initialize function", async () => {
  // Test the initialize function
  const daoAddress = "0xda0";
  const daoURIValue = "https://example.com/dao";
  const version = "v1";

  const result = await initialize(daoAddress, daoURIValue, version);

  assert.equal(result, true, 'Dao initialization should be successful');
});

test("setDaoURI function", async () => {
  const daoAddress = "0xda0";
  const daoURIValue = "https://example.com/dao";
  const version = "v1";

  await initialize(daoAddress, daoURIValue, version);
  
  const newDaoURI = "https://example.com/new-dao-uri";
  const result = await setDaoURI(newDaoURI, version);

  await new Promise(resolve => setTimeout(resolve, 200));
  const daoUri = await daoURI("v1");

  assert.equal(result, true);
  assert.strictEqual(daoUri, newDaoURI, 'Dao URI should match new DAO URI');
});

test("daoURI function", async () => {

  const daoAddress = "0xda0";
  const daoURIValue = "https://example.com/dao";
  const version = "v1";

  await initialize(daoAddress, daoURIValue, version);
  
  const result = await daoURI(version);
  assert.equal(result, daoURIValue, 'Dao URI should match initialised URI');
});

test("protocolVersion function", async () => {
  
  const daoAddress = "0xda0";
  const daoURIValue = "https://example.com/dao";
  const version = "v1";

  await initialize(daoAddress, daoURIValue, version);
  
  const result = await protocolVersion();
  assert.strictEqual(version, result, 'Protocol version should match the initialized version')
});

});

// Helper function to reset the database
async function resetDatabase() {
  const db = connection();
  await db.exec('DELETE FROM Dao');
  closeDatabaseConnection(db);
}
