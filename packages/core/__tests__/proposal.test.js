// Import the necessary modules and functions
import { test, assert } from "vitest";
import {createProposal, proposalCount, proposalExists, executeProposal } from "../src/proposal.js";

// Mock the database connection functions
const mockConnection = () => {
  return {
    get: (_, __, callback) => callback(null, { count: 1 }),
    run: (_, __, callback) => callback(null, { lastID: 1 }),
    all: (_, __, callback) => callback(null, [{ ActionObject: '{}' }]),
  };
};

// Start writing tests

test("createProposal function", async () => {
  
  // Test the createProposal function
  const result = await createProposal(
    "proposer",
    { title: "Proposal Title", description: "Proposal Description" },
    "startDate",
    "endDate",
    [{ action: "some action" }],
    {}
  );
  console.log(result) ;
});

test("executeProposal function", async () => {
  
  // Test the executeProposal function
  await assert.doesNotRejectAsync(async () => {
    await executeProposal(1);
  });
});

test("proposalCount function", async () => {

  // Test the proposalCount function
  const result = await proposalCount();
  assert.equal(result, 1);
});

test("proposalExists function", async () => {

  // Test the proposalExists function
  const result = await proposalExists(1);
  assert.equal(result, true);
});
