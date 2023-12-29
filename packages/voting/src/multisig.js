import { connection, closeDatabaseConnection } from "../../database/connection.js";

/**
 * @notice Adds new members to the address list.
 * @param {string} member - The address of the member to be added.
 * @returns {boolean} - True if the member was successfully added, false otherwise.
 */
function addAddresses(member) {
  let db = connection();

  try {
    db.run('INSERT INTO Members (address) VALUES (?)', [member]);
    return true;
  } catch (error) {
    console.error(`Error in addAddresses: ${error.message}`);
    return false;
  } finally {
    closeDatabaseConnection(db);
  }
}

/**
 * @notice Removes existing members from the address list.
 * @param {string} member - The address of the member to be removed.
 * @returns {boolean} - True if the member was successfully removed, false otherwise.
 */
function removeAddresses(member) {
  let db = connection();

  try {
    db.run('DELETE FROM Members WHERE address = ?', [member]);
    return true;
  } catch (error) {
    console.error(`Error in removeAddresses: ${error.message}`);
    return false;
  } finally {
    closeDatabaseConnection(db);
  }
}

/**
 * @notice Approves and, optionally, executes the proposal.
 * @param {string} voter - The address/ID of the voter.
 * @param {number} proposalId - The ID of the proposal.
 * @returns {boolean} - True if the approval was successful, false otherwise.
 */
function approve(voter, proposalId) {
  let db = connection();

  try {
    // Validate the proposal
    const proposal = db.get('SELECT * FROM Proposals WHERE ProposalID = ?', [proposalId]);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found.`);
    }

    db.run('INSERT INTO Votes (VoteID, ProposalID, VoteOption) VALUES (?, ?, ?)', [voter, proposalId, "Approve"]);
    return true;
  } catch (error) {
    console.error(`Error in approve: ${error.message}`);
    return false;
  } finally {
    closeDatabaseConnection(db);
  }
}

export { 
  addAddresses, 
  removeAddresses, 
  approve
};
