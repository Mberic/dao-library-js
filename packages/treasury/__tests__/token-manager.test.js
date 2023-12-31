// __test__/token-manager.test.js
import { describe, it, expect } from 'vitest';
import {
  mint,
  issue,
  assign,
  burn,
  assignVested,
  revokeVesting,
  getVesting,
  spendableBalanceOf,
} from '../src/token-manager.js';

// Test suite
describe('Token Manager Tests', () => {
  // Test for mint
  it('should mint tokens for the receiver', () => {
    mint('MEMBER_ADDRESS', 100); // Replace 'receiverAddress' with an actual address
    // Add assertions if needed
  });

  // Test for issue
  it('should issue tokens for the Token Manager', () => {
    issue(100);
    // Add assertions if needed
  });

  // Test for assign
  it('should assign tokens to the receiver', () => {
    assign('MEMBER_ADDRESS', 50); // Replace 'receiverAddress' with an actual address
    // Add assertions if needed
  });

  // Test for burn
  it('should burn tokens from the holder', () => {
    burn('MEMBER_ADDRESS', 20); // Replace 'holderAddress' with an actual address
    // Add assertions if needed
  });

  // Test for assignVested
  it('should assign vested tokens to the receiver', () => {
    assignVested('MEMBER_ADDRESS', 50, 'start', 'cliff', 'vested', true); // Replace 'receiverAddress' with an actual address
    // Add assertions if needed
  });

  // Test for revokeVesting
  it('should revoke vesting for the holder', () => {
    revokeVesting('MEMBER_ADDRESS', 1); // Replace 'holderAddress' with an actual address
    // Add assertions if needed
  });

  // Test for getVesting
  it('should get vesting details for the recipient and vesting ID', async () => {
    const vestingDetails = await getVesting('MEMBER_ADDRESS', 1); // Replace 'recipientAddress' with an actual address
    // Add assertions if needed
    expect(vestingDetails).not.toBe(null);
  });

  // Test for spendableBalanceOf
  it('should get the spendable balance of the holder', async () => {
    const balance = await spendableBalanceOf('MEMBER_ADDRESS'); // Replace 'holderAddress' with an actual address
    // Add assertions if needed
    expect(balance).not.toBe(null);
  });
});
