// Import the necessary modules and functions
import { test } from 'mocha';
import assert from 'assert';

import * as permissionModule from "../src/permissions.js";
import { connection, closeDatabaseConnection } from '../../database/connection.js';

describe('Permission functions', () => {

  beforeEach(async () => {
    // Reset the database before each test
    const db = connection();
    await db.exec('PRAGMA foreign_keys = OFF'); // Disable foreign key constraints for testing
    await db.exec('BEGIN TRANSACTION');
    await resetDatabase();
  });

test("grant function", async () => {
  
  const result = await permissionModule.grant("targetFunction", "address", "permissionId");
  assert.equal(result, true);
});

test("revoke function", async () => {

  await permissionModule.grant("targetFunc", "address", "permissionId");
  await new Promise(resolve => setTimeout(resolve, 125));

  const result = await permissionModule.revoke("targetFunction", "address", "permissionId");
  assert.equal(result, true);
  });

  test("has permission function", async () =>{

    await permissionModule.grant("targetFunction", "address", "permissionId");
    const result = await permissionModule.hasPermission("targetFunction", "address", "permissionId");
    assert.strictEqual(result, true, 'Permission check should return the right boolean value');
  });
});

// Helper function to reset the database
async function resetDatabase() {
  const db = connection();
  await db.exec('DELETE FROM Permission');
  closeDatabaseConnection(db);
}
