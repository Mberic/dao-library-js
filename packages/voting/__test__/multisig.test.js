// __test__/multisig.test.js
import { describe, it, expect } from 'vitest';
import {
  addAddresses,
  removeAddresses,
  approve
} from '../src/multisig.js';

// Test suite
describe('Multisig Tests', () => {
  // Test for addAddresses
  it('should add a new member to the address list', () => {
    const result = addAddresses('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
    expect(result).toBe(true);
  });

  // Test for removeAddresses
  it('should remove an existing member from the address list', () => {
    const result = removeAddresses('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
    expect(result).toBe(true);
  });

  // Test for approve
  it('should approve a proposal successfully', () => {
    const result = approve('voterAddress', 1); 
    expect(result).toBe(true);
  });
  
});
