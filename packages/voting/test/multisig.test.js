// test/multisig.test.js
import assert from 'assert';
import { describe, it } from 'mocha';
import { connection, closeDatabaseConnection } from '../../database/connection.js';

import {
  addAddresses,
  removeAddresses,
  approve
} from '../src/multisig.js';

// Test suite
describe('Multisig Tests', () => {

  beforeEach(async () => {
    // Reset the database before each test
    const db = connection();
    await db.exec('PRAGMA foreign_keys = OFF'); // Disable foreign key constraints for testing
    await db.exec('BEGIN TRANSACTION');
    await resetDatabase();
  });

  // Test for addAddresses
  it('should add a new member to the address list', () => {
    const result = addAddresses('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
   assert.equal(result, true);
  });

  // Test for removeAddresses
  it('should remove an existing member from the address list', () => {
    const result = removeAddresses('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
   assert.equal(result, true);
  });

  // Test for approve
  it('should approve a proposal successfully', () => {
    const result = approve('voterAddress', 1); 
   assert.equal(result, true);
  });
  
});

// Helper function to reset the database
async function resetDatabase() {
  const db = connection();
  await db.exec('DELETE FROM Members');
  closeDatabaseConnection(db);
}
