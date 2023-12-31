import { closeDatabaseConnection, connection } from "@dao-library/database";
import crypto from 'crypto';

/**
 * @returns {Promise<number>} A Promise that resolves with the count of proposals in the database.
 */
function proposalCount() {

    let db = connection();

    return new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) AS count FROM Proposals', (err, row) => {
            closeDatabaseConnection(db); 
            if (err) {
                reject(err);
            } else {
                resolve(row.count);
            }
        });
    });
}

/**
 * @param {number} proposalId - The unique identifier of the proposal.
 * @returns {Promise<boolean>} A Promise that resolves with a boolean indicating whether the proposal with the specified ID exists.
 */
function proposalExists(proposalId) {

    let db = connection();

    return new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) AS count FROM Proposals WHERE ProposalID = ?', [proposalId], (err, row) => {
        
            closeDatabaseConnection(db);
            if (err) {
            reject(err);
            } else {
                resolve(row.count > 0);
            }
        });
    });
}

/**
 * @param {string} proposer - The address of the proposer submitting the proposal.
 * @param {Object} metadata - Metadata object containing information about the proposal (e.g., title, description).
 * @param {string} startDate - The start date of the proposal.
 * @param {string} endDate - The end date of the proposal.
 * @param {Array<Object>} actions - An array of action objects representing the steps to be executed if the proposal is approved.
 * @returns {Promise<number>} A Promise that resolves with the ID of the newly created proposal.
 */
function createProposal(proposer, metadata, startDate, endDate, actions) {
    let db = connection();

    return new Promise((resolve, reject) => {
        const proposalID = generateHash(metadata.title); // Generate ProposalID using SHA-256 hash

        db.run('INSERT INTO Proposals (ProposalID, Proposer, Title, Description, StartDate, EndDate) VALUES (?, ?, ?, ?, ?, ?)',
            [proposalID, proposer, metadata.title, metadata.description, startDate, endDate], function (err) {
                closeDatabaseConnection(db);
                if (err) {
                    reject(err);
                } else {
                    
                    // Assuming you have an Actions table
                    // Insert actions associated with the proposal
                    // Check if actions is an array
                    if (Array.isArray(actions)) {
                        actions.forEach(action => {
                            db.run('INSERT INTO Actions (ProposalID, ActionObject) VALUES (?, ?)', [proposalID, JSON.stringify(action)]);
                        });
                    } else {
                        db.run('INSERT INTO Actions (ProposalID, ActionObject) VALUES (?, ?)', [proposalID, JSON.stringify(actions)]);
                    }

                    resolve(proposalID);
                }
            });
    });
}

/**
 * @param {number} proposalId - The unique identifier of the proposal to be executed.
 * @returns {Promise<Object[]>} - A promise that resolves to an array of action objects.
 */
async function getActionObject(proposalId) {
    try {
        const db = connection();

        // Assuming you have an Actions table
        const rows = await new Promise((resolve, reject) => {
            // Get actions associated with the proposal
            db.all('SELECT ActionObject FROM Actions WHERE ProposalID = ?', [proposalId], (err, rows) => {
                closeDatabaseConnection(db);
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        // Map the rows to action objects
        const proposalActions = rows.map(row => JSON.parse(row.ActionObject));

        return proposalActions;
    } catch (error) {
        throw error;
    }
}

// Function to generate SHA-256 hash
function generateHash(data) {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
  }

export { proposalCount, getActionObject, proposalExists, createProposal };