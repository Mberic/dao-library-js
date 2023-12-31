import { connection, closeDatabaseConnection } from "@dao-library/database";

/**
 * Checks if a given address is a member.
 * @param {string} address - The address to check for membership.
 * @returns {Promise<boolean>} - A promise that resolves to true if the address is a member, false otherwise.
 */
async function isMember(address) {
    try {
        const db = connection();

        // Query the Members table to check if the address exists
        const result = await new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) AS count FROM Members WHERE address = ?', [address], (err, row) => {
                closeDatabaseConnection(db);
                if (err) {
                    reject(err);
                } else {
                    resolve(row.count > 0); // If count is greater than 0, the address is a member
                }
            });
        });

        return result;
    } catch (error) {
        throw error;
    }
}

export { isMember };