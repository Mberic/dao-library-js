import { connection, closeDatabaseConnection } from "@dao-library/database";

/**
 * Returns the support threshold parameter stored in the voting settings.
 * @return {Promise<number|null>} - A promise that resolves to the support threshold parameter.
 */
function supportThreshold() {
  return new Promise((resolve, reject) => {
    const db = connection();

    db.get('SELECT SupportThreshold FROM VotingSettings', (err, result) => {
      closeDatabaseConnection(db);

      if (err) {
        console.error(`Error in supportThreshold: ${err.message}`);
        reject(err);
      } else {
        resolve(result ? result.SupportThreshold : null);
      }
    });
  });
}

/**
 * Returns the minimum participation parameter stored in the voting settings.
 * @return {Promise<number|null>} - A promise that resolves to the minimum participation parameter.
 */
function minParticipation() {
  return new Promise((resolve, reject) => {
    const db = connection();

    db.get('SELECT MinParticipation FROM VotingSettings', (err, result) => {
      closeDatabaseConnection(db);

      if (err) {
        console.error(`Error in minParticipation: ${err.message}`);
        reject(err);
      } else {
        resolve(result ? result.MinParticipation : null);
      }
    });
  });
}

/**
 * Checks if the support value defined for a proposal vote is greater than the support threshold.
 * @param {number} proposalId - The ID of the proposal.
 * @return {Promise<boolean>} - A promise that resolves to `true` if the support is greater than the support threshold and `false` otherwise.
 */
async function isSupportThresholdReached(proposalId) {
  return new Promise(async (resolve, reject) => {
    const db = connection();

    try {
      // Get the count of votes for the proposal
      const result = await new Promise((resolveVotes, rejectVotes) => {
        db.get('SELECT COUNT(*) AS count FROM Votes WHERE ProposalID = ?', [proposalId], (err, row) => {
          if (err) {
            rejectVotes(err);
          } else {
            resolveVotes(row ? row.count : 0);
          }
        });
      });

      // Get the support threshold
      const threshold = await supportThreshold();

      // Determine if the support is greater than the support threshold
      resolve(result > (threshold !== null ? threshold : 0));
    } catch (error) {
      console.error(`Error in isSupportThresholdReached: ${error.message}`);
      reject(false);
    } finally {
      // Close the database connection
      closeDatabaseConnection(db);
    }
  });
}


/**
 * Checks if the participation count for a proposal vote is greater than or equal to the minimum participation threshold.
 * @param {number} proposalId - The ID of the proposal.
 * @return {Promise<boolean>} - A promise that resolves to `true` if the participation is greater than or equal to the minimum participation threshold, and `false` otherwise.
 */
async function isMinParticipationReached(proposalId) {
  let db = connection();

  try {
    // Use a promise to asynchronously query the database
    const result = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) AS count FROM Votes WHERE ProposalID = ?', [proposalId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row.count : 0);
        }
      });
    });

    const minParticipationValue = await minParticipation();

    // Return the result based on the comparison with the min participation value
    return result && minParticipationValue !== null ? result >= minParticipationValue : false;
  } catch (error) {
    console.error(`Error in isMinParticipationReached: ${error.message}`);
    return false;
  } finally {
    closeDatabaseConnection(db);
  }
}

/**
 * Returns the vote option cast by a voter for a certain proposal.
 * @param {number} proposalId - The ID of the proposal.
 * @param {string} account - The account address to be checked.
 * @return {Promise<string|null>} - A promise that resolves to the vote option or `null` if no vote is found.
 */
async function getVoteOption(proposalId, account) {
  let db = connection();

  try {
    // Use a promise to asynchronously query the database
    const result = await new Promise((resolve, reject) => {
      db.get('SELECT VoteOption FROM Votes WHERE ProposalID = ? AND VoteID = ?', [proposalId, account], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row.VoteOption : null);
        }
      });
    });

    return result;
  } catch (error) {
    console.error(`Error in getVoteOption: ${error.message}`);
    return null;
  } finally {
    closeDatabaseConnection(db);
  }
}

/**
 * Votes for a vote option.
 * @param {string} voter - The voter address/ID.
 * @param {number} proposalId - The ID of the proposal.
 * @param {string} voteOption - The chosen vote option.
 * @returns {Promise<void>} A promise that resolves when the vote operation is completed.
 */
async function vote(voter, proposalId, voteOption) {
  return new Promise((resolve, reject) => {
    const db = connection();

    db.run('INSERT INTO Votes (VoteID, ProposalID, VoteOption) VALUES (?, ?, ?)', [voter, proposalId, voteOption], (err) => {
      closeDatabaseConnection(db);

      if (err) {
        console.error(`Error in vote: ${err.message}`);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Set the minimum participation in the voting settings.
 * @param {number} minParticipation - The new minimum participation value.
 * @returns {Promise<boolean>} A promise that resolves to true if the operation is successful, false otherwise.
 */
async function setMinParticipation(minParticipation) {
  return new Promise((resolve, reject) => {
    const db = connection();

    db.run('INSERT INTO VotingSettings (MinParticipation) VALUES(?)', [minParticipation], async (err) => {
      closeDatabaseConnection(db);

      if (err) {
        console.error(`Error in setMinParticipation: ${err.message}`);
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}

/**
 * Set the support threshold in the voting settings.
 * @param {number} supportThreshold - The new support threshold value.
 * @returns {Promise<boolean>} A promise that resolves to true if the operation is successful, false otherwise.
 */
async function setSupportThreshold(supportThreshold) {
  return new Promise((resolve, reject) => {
    const db = connection();

    db.run('INSERT INTO VotingSettings (SupportThreshold) VALUES (?) ', [supportThreshold], async (err) => {
      
      if (err) {
        console.error(`Error in setSupportThreshold: ${err.message}`);
        reject(err);
      } else {
        resolve(true);
      }
    });

    closeDatabaseConnection(db);
  });
}

export { 
  isMinParticipationReached, 
  isSupportThresholdReached,
  getVoteOption,
  minParticipation,
  supportThreshold,
  setMinParticipation,
  setSupportThreshold,
  vote
};
