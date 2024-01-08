// Import the necessary modules and functions
import {createProposal, proposalCount, proposalExists } from "../src/proposal.js";
import { connection, closeDatabaseConnection } from '../../database/connection.js';

import { test } from 'mocha';
import assert from 'assert';
import crypto from 'crypto';

describe('Proposal functions', () => {

  beforeEach(async () => {
    // Reset the database before each test
    const db = connection();
    await db.exec('PRAGMA foreign_keys = OFF'); // Disable foreign key constraints for testing
    await db.exec('BEGIN TRANSACTION');
    await resetDatabase();
  });

test("createProposal function", async () => {
  
  // Test the createProposal function
  const result = await createProposal(
    "proposer",
    { title: "Title", description: "Proposal Description" },
    "startDate",
    "endDate",
    [{ action: "some action" }],
    {}
  );
  
  assert.strictEqual(generateHash("Title"), result, 'Proposal ID should match sha256 of the Proposal "metadata.title" value');
});

test("proposalCount function", async () => {

  await createProposal(
    "proposer",
    { title: "Title1", description: "Proposal Description1" },
    "startDate",
    "endDate",
    [{ action: "some action" }],
    {}
  );
  
  await new Promise(resolve => setTimeout(resolve, 200));

  await createProposal(
    "proposer",
    { title: "Title2", description: "Proposal Description2" },
    "startDate",
    "endDate",
    [{ action: "some action" }],
    {}
  );
  

  const result = await proposalCount();
  assert.strictEqual(result, 2, 'Proposal count should match added proposals');

});

test("proposalExists function", async () => {

  // Test with non-existent proposalID
  const result1 = await proposalExists("123567000");
  assert.equal(result1, false);

  // Create a proposal ID and then test
  const b = await createProposal(
    "proposer",
    { title: "Title2", description: "Proposal Description2" },
    "startDate",
    "endDate",
    [{ action: "some action" }],
    {}
  );

  // 4c7a...322 is the sha256("Title2")
  const result2 = await proposalExists("4c7aea28f54a1525bdd0ac2e1619be898b809a3662e6f6b3ec105e3b6b8c2322");
  assert.equal(result2, true);
});


});

// Helper function to reset the database
async function resetDatabase() {
  const db = connection();
  await db.exec('DELETE FROM Proposals');
  closeDatabaseConnection(db);
}

// Function to generate SHA-256 hash
function generateHash(data) {
  const hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
}
