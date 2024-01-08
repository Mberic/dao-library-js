import { describe, it, beforeEach, afterEach, expect, test } from 'vitest';
import { initializeTokenManager, assign, assignVested, burn, getVesting, issue, mint, revokeVesting, spendableBalanceOf } from '../src/token-manager.js';

import assert from 'assert';
import { connection, closeDatabaseConnection } from "@dao-library/database";

describe('Token Manager Functions', () => {
  beforeEach(async () => {
    // Reset the database before each test
    const db = connection();
    await db.exec('PRAGMA foreign_keys = OFF'); // Disable foreign key constraints for testing
    await db.exec('BEGIN TRANSACTION');
    await resetDatabase();
  });

  afterEach(async () => {
    // Rollback the transaction after each test
    const db = connection();
    await db.exec('ROLLBACK');
    await db.exec('PRAGMA foreign_keys = ON'); // Enable foreign key constraints after testing
    closeDatabaseConnection(db);
  });

  it('should initialize the token manager with initial supply and add 0xda0 member', async () => {
    const tokenName = 'TestToken';
    const tokenSymbol = 'TT';
    const initialSupply = 1000;

    const result = await initializeTokenManager(tokenName, tokenSymbol, initialSupply);

    assert.strictEqual(result, true, 'Initialization should be successful');

    const db = connection();

    console.log("Db conection..........." + db);
});

});

// Helper function to reset the database
async function resetDatabase() {
  const db = connection();
  await db.exec('DELETE FROM Token');
  await db.exec('DELETE FROM Members');
  await db.exec('DELETE FROM Vesting');
  closeDatabaseConnection(db);
}
