import { test, describe} from "mocha";
import assert from 'assert';

import { isMember } from '../src/membership.js';
import { connection, closeDatabaseConnection } from '../../database/connection.js';

describe('Membership functions', () => {

  beforeEach(async () => {
    // Reset the database before each test
    const db = connection();
    await db.exec('PRAGMA foreign_keys = OFF'); // Disable foreign key constraints for testing
    await db.exec('BEGIN TRANSACTION');
    await resetDatabase();
  });

test('isMember should return true for an existing member', async () => {

  const db = connection();
    
  try {

    await db.run(`INSERT INTO Members (address) VALUES ('0xfeed');`);
    await new Promise(resolve => setTimeout(resolve, 100));

    const result = await isMember('0xfeed');
    assert.strictEqual(result, true, 'Member existence should be TRUE');

  } finally {
    closeDatabaseConnection(db);
  }

});

test('isMember should return false for a non-existing member', async () => {
  // Assuming 'nonExistingMemberAddress' is an address that doesn't exist in your Members table
  const result = await isMember('0xdead');
  
  assert.strictEqual(result, false, 'Member existence should be FALSE');

});
});

// Helper function to reset the database
async function resetDatabase() {
  const db = connection();
  await db.exec('DELETE FROM Members');
  closeDatabaseConnection(db);
}
