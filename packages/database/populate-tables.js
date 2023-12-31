import { connection, closeDatabaseConnection } from "./connection.js";

const db = connection();

async function populateTables() {
  try {

    // Insert into Dao table
    db.run(`
      INSERT INTO Dao (daoAddress, daoURI, version) 
      VALUES ('DAO_ADDRESS', 'https://example.com', '1.0');
    `);

    // Insert into Permission table
    db.run(`
      INSERT INTO Permission (who, function, permissionId) 
      VALUES ('MEMBER_ADDRESS', 'DO_SOMETHING', 1);
    `);

    // Insert into Proposals table
    db.run(`
      INSERT INTO Proposals (ProposalID, Proposer, Title, Description, Status, EndDate) 
      VALUES ('PROPOSAL_ID', 'PROPOSER_ADDRESS', 'Proposal Title', 'Proposal Description', 'Proposed', '2023-12-31 23:59:59');
    `);

    // Insert into Actions table
    db.run(`
      INSERT INTO Actions (ProposalID, ActionObject, Status, Result) 
      VALUES (1, 'SOME_OBJECT', 'Pending', NULL);
    `);

    // Insert into Votes table
    db.run(`
      INSERT INTO Votes (ProposalID, VoteOption) 
      VALUES (1, 'Approve,Reject,Abstain');
    `);

    // Insert into VotingSettings table
    db.run(`
      INSERT INTO VotingSettings (ProposalID, SupportThreshold, MinParticipation, QuorumRequirement, VoteDuration, GracePeriod, VotePowerDistribution, 
        VoteWeights, ExecutionThreshold, VoteDecay, DelegatedVoting, TallyingAlgorithm, VoteFinality, VoteRevealPeriod, VoteLocking) 
      VALUES (1, 50, 30, 20, 3600, 300, 'Linear', '[1, 2, 3]', 70, 86400, true, 'SimpleMajority', false, 600, true);
    `);

    // Insert into Members table
    db.run(`
      INSERT INTO Members (address, balance, vestingId) 
      VALUES ('MEMBER_ADDRESS', 1000, 1);
    `);

    // Insert into Treasury table
    db.run(`
      INSERT INTO Treasury (TransactionID, SenderAddress, ReceiverAddress, Amount, Balance, Purpose) 
      VALUES (1, 'DAO_ADDRESS', 'RECEIVER_ADDRESS', 500, 500, 'ProposalID or Description');
    `);

    // Insert into Vesting table
    db.run(`
      INSERT INTO Vesting (HolderAddress, Amount, StartDate, CliffDate, VestedDate, Revokable, Revoked) 
      VALUES ('MEMBER_ADDRESS', 500, '2023-01-01', '2024-01-01', '2025-01-01', true, false);
    `);

  } catch (error) {
    console.error(`Error in populateTables: ${error.message}`);
  } finally {
    closeDatabaseConnection(db);
  }
}

// Call the function to populate tables
populateTables();
