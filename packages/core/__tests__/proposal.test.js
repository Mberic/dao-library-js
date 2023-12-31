// Import the necessary modules and functions
import { test, assert } from "vitest";
import {createProposal, proposalCount, proposalExists } from "../src/proposal.js";

// Tests

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
  console.log(result) ;
});

test("proposalCount function", async () => {

  // Test the proposalCount function
  const result = await proposalCount();
  assert.equal(result, 1);
});

test("proposalExists function", async () => {

  // Test the proposalExists function
  const result = await proposalExists(1);
  assert.equal(result, false);

  // Test the proposalExists function
  const result2 = await proposalExists("77f0d7706877c72ed7f6646fc7c476d022637eb0709ec65750add925416fefa7");
  assert.equal(result2, false);
});
