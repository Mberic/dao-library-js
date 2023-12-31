import { isMember } from '../src/membership.js';
import {expect , test, describe, it} from "vitest";

test('isMember should return true for an existing member', async () => {
  // Assuming 'MEMBER_ADDRESS' is an address that already exists in your Members table
  const result = await isMember('MEMBER_ADDRESS');
  expect(result).toBe(true);
});

test('isMember should return false for a non-existing member', async () => {
  // Assuming 'nonExistingMemberAddress' is an address that doesn't exist in your Members table
  const result = await isMember('nonExistingMemberAddress');
  expect(result).toBe(false);
});
