import { isMember } from '../src/membership.js';
import {expect , describe, it} from "vitest";

describe('Membership Tests', () => {
  it('should return true for an existing member', async () => {
    // Ensure you have an existing member in the database
    const result = await isMember('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    expect(result).toBe(true);
  });

  it('should return false for a non-existing member', async () => {
    // Replace 'nonExistingMemberAddress' with an address that is not a member
    const result = await isMember('nonExistingMemberAddress');
    expect(result).toBe(false);
  });

  it('should handle errors gracefully', async () => {
    // This test ensures that the function handles errors and rejects the promise appropriately
    const invalidAddress = 'invalidAddress'; // This is intentionally invalid
    await expect(isMember(invalidAddress)).rejects.toThrow();
  });
});
