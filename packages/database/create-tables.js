import { connection, closeDatabaseConnection } from "./connection.js";

const db = connection();

// Function to create a table
function createTable(tableName, createTableSQL) {
  db.run(createTableSQL, (err) => {
    if (err) {
      console.error(`Error creating ${tableName} table: ${err.message}`);
    } else {
      console.log(`${tableName} table created successfully.`);
    }
  });
}

// Create tables one at a time
createTable('Members', createMembersTable());
createTable('Dao', createDaoTable());
createTable('Permission', createPermissionTable());
createTable('Proposals', createProposalsTable());
createTable('Votes', createVotesTable());
createTable('VotingSettings', createVotingSettings());
createTable('Treasury', createTreasuryTable());
createTable('Vesting', createVestingTable());
createTable('Actions', createActionsTable());

// Close the database connection
closeDatabaseConnection();


function createDaoTable() {
    return `
      CREATE TABLE IF NOT EXISTS Dao (
        id SERIAL PRIMARY KEY,
        daoAddress VARCHAR(255) NOT NULL,
        daoURI VARCHAR(255),
        version VARCHAR(50) UNIQUE NOT NULL
      );
    `;
  }


  function createPermissionTable() {
    return `
      CREATE TABLE IF NOT EXISTS Permission (
        who VARCHAR(255) PRIMARY KEY,
        function VARCHAR(255) NOT NULL,
        permissionId SERIAL
      );
    `;
  }
  
  function createProposalsTable() {
    return `
      CREATE TABLE IF NOT EXISTS Proposals (
        ProposalID VARCHAR(255) PRIMARY KEY,
        Proposer VARCHAR(255),
        Title VARCHAR(255) NOT NULL,
        Description TEXT, -- This can used for the forum link 
        Status VARCHAR(50) DEFAULT 'Proposed',
        StartDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        EndDate TIMESTAMP
      );
    `;
  }
  
  function createActionsTable(){
    return `
      CREATE TABLE IF NOT EXISTS Actions (
        ActionID SERIAL PRIMARY KEY,
        ProposalID INTEGER REFERENCES Proposals(ProposalID),
        ActionObject VARCHAR,
        Status VARCHAR(50) DEFAULT 'Pending',
        Result VARCHAR,
        Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(ActionID)
      );
  `;
  }
  
  function createVotesTable() {
    return `
      CREATE TABLE IF NOT EXISTS Votes (
        VoteID SERIAL PRIMARY KEY,
        ProposalID INTEGER REFERENCES Proposals(ProposalID),
        VoteOption TEXT     -- Comma-separated list of vote options (e.g., 'Approve,Reject,Abstain') or some codes to represent the options
      );
    `;
  }
  
  function createVotingSettings(){
    return `
    CREATE TABLE IF NOT EXISTS VotingSettings (
      ProposalID INTEGER PRIMARY KEY REFERENCES Proposals(ProposalID),
      SupportThreshold INTEGER,
      MinParticipation INTEGER,
      QuorumRequirement INTEGER,
      VoteDuration INTEGER,  -- Duration in seconds
      GracePeriod INTEGER,   -- Grace period after the official end of the vote in seconds
      VotePowerDistribution TEXT,  -- Define how voting power is distributed (e.g., 'Linear', 'Quadratic')
      VoteWeights TEXT,     -- JSON array specifying vote weights based on criteria
      ExecutionThreshold INTEGER,
      VoteDecay INTEGER,    -- Decay rate for votes over time in seconds
      DelegatedVoting BOOLEAN,
      TallyingAlgorithm TEXT,  -- Algorithm for calculating the final result (e.g., 'SimpleMajority', 'Supermajority')
      VoteFinality BOOLEAN,
      VoteRevealPeriod INTEGER,  -- Period for revealing secret votes in seconds
      VoteLocking BOOLEAN
    );    
    `;
  }

  function createMembersTable() {
    return `
    CREATE TABLE IF NOT EXISTS Members (
      address VARCHAR(255) PRIMARY KEY,
      balance INTEGER,
      vestingId INTEGER -- Reference to vesting information if applicable
  );
  
    `;
  }
  
  function createTreasuryTable(){
    return `
      CREATE TABLE IF NOT EXISTS Treasury (
        TransactionID INTEGER PRIMARY KEY,
        SenderAddress VARCHAR(255),
        ReceiverAddress VARCHAR(255),
        Amount INTEGER,
        Balance INTEGER,
        Purpose TEXT -- this can be a ProposalID or link to description
      );
    `;
  }

  function createVestingTable(){
    return  `
      CREATE TABLE IF NOT EXISTS Vesting (
        VestingID INTEGER PRIMARY KEY,
        HolderAddress VARCHAR(255),
        Amount INTEGER,
        StartDate DATETIME,
        CliffDate DATETIME,
        VestedDate DATETIME,
        Revokable BOOLEAN,
        Revoked BOOLEAN DEFAULT FALSE
    );
  `;
  }