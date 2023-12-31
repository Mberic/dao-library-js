import { connection, closeDatabaseConnection } from "@dao-library/database";

/**
 * Returns the support threshold parameter stored in the voting settings.
 * @return {number|null} - The support threshold parameter.
 */
function supportThreshold() {
  let db = connection();

  try {
    const result = db.get('SELECT SupportThreshold FROM VotingSettings');
    return result ? result.SupportThreshold : null;
  } catch (error) {
    console.error(`Error in supportThreshold: ${error.message}`);
    return null;
  } finally {
    closeDatabaseConnection(db);
  }
}

/**
 * Returns the minimum participation parameter stored in the voting settings.
 * @return {number|null} - The minimum participation parameter.
 */
function minParticipation() {
  let db = connection();

  try {
    const result = db.get('SELECT MinParticipation FROM VotingSettings');
    return result ? result.MinParticipation : null;
  } catch (error) {
    console.error(`Error in minParticipation: ${error.message}`);
    return null;
  } finally {
    closeDatabaseConnection(db);
  }
}

/**
 * Checks if the support value defined for a proposal vote is greater than the support threshold.
 * @param {number} proposalId - The ID of the proposal.
 * @return {boolean} - Returns `true` if the support is greater than the support threshold and `false` otherwise.
 */
function isSupportThresholdReached(proposalId) {
  let db = connection();

  try {
    const result = db.get('SELECT COUNT(*) AS count FROM Votes WHERE ProposalID = ?', [proposalId]);
    const threshold = supportThreshold();
    return result.count && threshold !== null ? result.count > threshold : false;
  } catch (error) {
    console.error(`Error in isSupportThresholdReached: ${error.message}`);
    return false;
  } finally {
    closeDatabaseConnection(db);
  }
}

/**
 * Checks if the worst-case support value defined for a proposal vote is greater than the support threshold.
 * @param {number} proposalId - The ID of the proposal.
 * @return {boolean} - Returns `true` if the worst-case support is greater than the support threshold and `false` otherwise.
 */
function isSupportThresholdReachedEarly(proposalId) {
  try {
    // Assume worst-case support is equal to support
    return isSupportThresholdReached(proposalId);
  } catch (error) {
    console.error(`Error in isSupportThresholdReachedEarly: ${error.message}`);
    return false;
  }
}

/**
 * Checks if the participation value defined for a proposal vote is greater or equal than the minimum participation value.
 * @param {number} proposalId - The ID of the proposal.
 * @return {boolean} - Returns `true` if the participation is greater than the minimum participation and `false` otherwise.
 */
function isMinParticipationReached(proposalId) {
  let db = connection();

  try {
    const result = db.get('SELECT COUNT(*) AS count FROM Votes WHERE ProposalID = ?', [proposalId]);
    const minParticipationValue = minParticipation();
    return result && minParticipationValue !== null ? result.count >= minParticipationValue : false;
  } catch (error) {
    console.error(`Error in isMinParticipationReached: ${error.message}`);
    return false;
  } finally {
    closeDatabaseConnection(db);
  }
}

/**
 * Returns whether the account has voted for the proposal.
 * @param {number} proposalId - The ID of the proposal.
 * @param {string} account - The account address to be checked.
 * @return {string|null} - The vote option cast by a voter for a certain proposal.
 */
function getVoteOption(proposalId, account) {
  let db = connection();

  try {
    const result = db.get('SELECT VoteOption FROM Votes WHERE ProposalID = ? AND VoteID = ?', [proposalId, account]);
    return result ? result.VoteOption : null;
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
 */
function vote(voter, proposalId, voteOption) {
  let db = connection();

  try {
    // Update the Votes table to reflect the vote
    db.run('INSERT INTO Votes (VoteID, ProposalID, VoteOption) VALUES (?, ?, ?)', [voter, proposalId, voteOption]);
  } catch (error) {
    console.error(`Error in vote: ${error.message}`);
  } finally {
    closeDatabaseConnection(db);
  }
}

/**
 * Set the minimum participation in the voting settings.
 * @param {number} minParticipation - The new minimum participation value.
 * @returns {Promise<boolean>} A promise that resolves to true if the operation is successful, false otherwise.
 */
async function setMinParticipation(minParticipation) {
  let db = connection();

  try {
    await db.run('UPDATE VotingSettings SET MinParticipation = ?', [minParticipation]);
    closeDatabaseConnection(db);
    return true;
  } catch (error) {
    console.error(`Error in setMinParticipation: ${error.message}`);
    closeDatabaseConnection(db);
    return false;
  }
}

/**
 * Set the support threshold in the voting settings.
 * @param {number} supportThreshold - The new support threshold value.
 * @returns {Promise<boolean>} A promise that resolves to true if the operation is successful, false otherwise.
 */
async function setSupportThreshold(supportThreshold) {
  let db = connection();

  try {
    await db.run('UPDATE VotingSettings SET SupportThreshold = ?', [supportThreshold]);
    closeDatabaseConnection(db);
    return true;
  } catch (error) {
    console.error(`Error in setSupportThreshold: ${error.message}`);
    closeDatabaseConnection(db);
    return false;
  }
}

export { 
  isMinParticipationReached, 
  isSupportThresholdReached,
  isSupportThresholdReachedEarly,
  getVoteOption,
  minParticipation,
  supportThreshold,
  setMinParticipation,
  setSupportThreshold,
  vote
};
