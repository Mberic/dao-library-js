// majority-voting.test.js
import assert from 'assert';
import { test, describe, it } from 'mocha';

import {
  connection,
  closeDatabaseConnection,
} from '../../database/connection.js';
import {
  supportThreshold,
  minParticipation,
  isSupportThresholdReached,
  isMinParticipationReached,
  getVoteOption,
  setMinParticipation,
  setSupportThreshold,
  vote,
} from '../src/majority.js';


describe('majority voting tests', () => {
  beforeEach(async () => {
    // Reset the database before each test
    const db = connection();
    await db.exec('PRAGMA foreign_keys = OFF'); // Disable foreign key constraints for testing
    await db.exec('BEGIN TRANSACTION');
    await resetDatabase();
  });

    it('should return the correct support threshold', async () => {
      
    await setSupportThreshold(50);
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await supportThreshold();
    assert.equal(result, 50); 
  
    });
  

     it('should return the correct minimum participation', async () => {
      
      await setMinParticipation(10);
      const result = await minParticipation();
      assert.equal(result, 10); 
      
    });
  
    it('should return true if support is greater than threshold', async () => {
      const db = connection();
    
      try {
        // Insert a unique proposal before voting
        await db.run(`INSERT INTO Proposals (ProposalID, Title) VALUES ('123', 'TestTitle');`);
    
        await vote('0xabc', 123, 'Approve');
        await vote('0xabcd', 123, 'Approve');
    
        await setSupportThreshold(1);
        await new Promise(resolve => setTimeout(resolve, 100));
    
        const result = await isSupportThresholdReached(123); 
        assert.equal(result, true); 
      } finally {
        closeDatabaseConnection(db);
      }
    });
    

    it('should return true if participation is greater than minimum', async () => {
      
      const db = connection();
    
      try {
      
      // Insert a unique proposal before voting
      await db.run(`INSERT INTO Proposals (ProposalID, Title) VALUES ('123', 'TestTitle');`);

      // only unique voters can vote
      await vote('0xabc', 123, 'Approve');
      await vote('0xabcd', 123, 'Approve');
      await vote('0xabcde', 123, 'Approve');

      await setMinParticipation(3);
      
      const result = await isMinParticipationReached(123); // Replace with your proposalId
      assert.equal(result, true); 
    } finally {
      closeDatabaseConnection(db);
    }

    });
  

    it('should return the correct vote option for a proposal and account', async () => {
      
      const db = connection();
    
      try {
      
      // Insert a unique proposal before voting
      await db.run(`INSERT INTO Proposals (ProposalID, Title) VALUES ('123', 'TestTitle');`);

      await vote('0xabc', 123, 'Abstain');
      const result = await getVoteOption(123, '0xabc'); // Replace with your proposalId and account
      assert.equal(result, 'Abstain'); 
    } finally {
      closeDatabaseConnection(db);
    }
    });


    it('should set the minimum participation successfully', async () => {
      
      const result = await setMinParticipation(20);
      assert.equal(result, true); 
      
    });
  

    it('should set the support threshold successfully', async () => {

      const result = await setSupportThreshold(60);
      assert.equal(result, true); 
      
    });
  

    it('should record a vote successfully', async () => {
      
      const result = await vote('0xdac', 456, 'Approve'); 
      assert.equal(result, undefined); 
      
    });
  });


// Helper function to reset the database
async function resetDatabase() {
  const db = connection();
  await db.exec('DELETE FROM Votes');
  await db.exec('DELETE FROM Proposals');
  await db.exec('DELETE FROM VotingSettings');
  closeDatabaseConnection(db);
}
