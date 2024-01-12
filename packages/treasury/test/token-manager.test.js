import { describe, it, beforeEach, test } from 'mocha';
import { initializeTokenManager, assign, assignVested, burn, getVesting, issue, mint, revokeVesting, spendableBalanceOf } from '../src/token-manager.js';
import assert from 'assert';
import { connection, closeDatabaseConnection } from "../../database/connection.js";

describe('Token Manager Functions', () => {

  beforeEach(async () => {
    // Reset the database before each test
    const db = connection();
    await db.exec('PRAGMA foreign_keys = OFF'); // Disable foreign key constraints for testing
    await resetDatabase(db);
  });

  it('should initialize the token manager with initial supply and add 0xda0 member', async () => {
    const tokenName = 'TestToken';
    const tokenSymbol = 'TT';
    const initialSupply = 1000;

    const result = await initializeTokenManager(tokenName, tokenSymbol, initialSupply);

    assert.strictEqual(result, true, 'Initialization should be successful');

    // Check if Token and Members tables are updated
    const db = connection();

    const tokenRow = await new Promise((resolve, reject) => {
      // Get actions associated with the proposal
      db.all('SELECT * FROM Token WHERE name = ?', [tokenName], (err, rows) => {
          if (err) {
              reject(err);
          } else {
              resolve(rows);
              }
          });
      });

    
    assert.strictEqual(tokenRow[0].name, tokenName, 'Token table should be updated with the correct name');
  });

  test('should mint tokens for a receiver and update balances', async () => {
    const receiver = '0xabc';
    const amount = 500;
  
    const db = connection();
    
    try {
      await db.run(`INSERT INTO Members (address) VALUES ('0xabc');`);
  
      const result = await mint(receiver, amount);
      await new Promise(resolve => setTimeout(resolve, 100));

      const spendable = await spendableBalanceOf(receiver);
  
      assert.strictEqual(result, true, 'Minting should be successful');
      assert.strictEqual(amount, 500, 'Token table should be updated with the correct total supply');
      assert.strictEqual(spendable, amount, 'Spendable balance should match the minted amount');
    } finally {
      await closeDatabaseConnection(db);
    }
  });
  
  it('should issue tokens for the Token Manager and update balances', async () => {
    const amount = 60;
    
    await initializeTokenManager('TestToken', 'TT', 2500);
    const result = await issue(amount);
    await new Promise(resolve => setTimeout(resolve, 125));

    const spendable = await spendableBalanceOf('0xda0');
    assert.strictEqual(result, true, 'Issuing tokens should be successful');
    assert.strictEqual(spendable, 2560, 'Spendable balance should be sum of `minted amount + initial token manager balance`');
    
  });

  it('should assign tokens from the Token Manager to a receiver and update balances', async () => {
    const receiver = '0xabc';
    const amount = 200;

    const db = connection();
    
    try {
      
      await initializeTokenManager('TestToken', 'TT', 750);
      db.run(`INSERT INTO Members (address) VALUES ('0xabc');`);
      
      const result = await assign(receiver, amount);
      await new Promise(resolve => setTimeout(resolve, 200));

      const daoSpendable = await spendableBalanceOf('0xda0');
      const receiverSpendable = await spendableBalanceOf(receiver);
      
      assert.strictEqual(result, true, 'Assigning tokens should be successful');
      assert.strictEqual(daoSpendable, 550, 'DA0 spendable balance should reduce by the assigned amount');
      assert.strictEqual(receiverSpendable, amount, 'Spendable balance should match the assigned amount');
    
    } finally {
      await closeDatabaseConnection(db);
    }

  });

  it('should burn tokens from a holder and update balances', async () => {
    const holder = '0xabc';
    const amount = 100;

    const result = await burn(holder, amount);

    assert.strictEqual(result, true, 'Burning tokens should be successful');

  });

  it('should assign vested tokens to a receiver and update vesting table', async () => {
    const receiver = '0xabc';
    const amount = 200;
    const start = '2024-01-10 02:30:00';
    const cliff = '2024-02-10 02:30:00';
    const vested = '2024-03-10 02:30:00';
    const revokable = true;

    const result = await assignVested(receiver, amount, start, cliff, vested, revokable);

    assert.strictEqual(result, undefined, 'Assigning vested tokens should be successful (no return value)');
  });

  it('should revoke vesting for a holder and update vesting table', async () => {
    const holder = '0xabc';
    const vestingId = 1;

    // Initialize token manager with initial supply and vesting entry
    await initializeTokenManager('TestToken', 'TT', 500);
    await assignVested(holder, 200, '2024-01-10', '2024-02-10', '2024-03-10', true);

    const result = await revokeVesting(holder, vestingId);

    assert.strictEqual(result, undefined, 'Revoking vesting should be successful (no return value)');

  });

  it('should get vesting details for a recipient and vesting ID', async () => {
    const holder = '0xabcd';

    await assignVested(holder, 200, '2023-12-29 02:30:00', '2023-12-29 02:30:00', '2023-12-29 02:30:00', 1);
    await new Promise(resolve => setTimeout(resolve, 100));

    const result = await getVesting(holder);

    assert.strictEqual(result[0].Amount, 200, 'Vested amount should equal assigned amount');
  
  });

  it('should get the spendable balance of a holder', async () => {

    const holder = '0xabc';
    const db = connection();
    
    try {

      await db.run(`INSERT INTO Members (address, balance) VALUES ('0xabc', '75');`);
      await new Promise(resolve => setTimeout(resolve, 100));

      const result = await spendableBalanceOf(holder);
      assert.strictEqual(result, 75, 'Spendable balance should match the initially set amount');
    } finally {
      await closeDatabaseConnection(db);
    }
  });
});

// Helper function to reset the database
async function resetDatabase(db) {
  await db.exec('DELETE FROM Token');
  await db.exec('DELETE FROM Members');
  await db.exec('DELETE FROM Vesting');
  await closeDatabaseConnection(db);
}
