const getCodeUserWalletTransactions = async (pool, customeid, limit, offset) => {
    try {
        const query = `
            SELECT t1.*, t1.date as de, t2.* 
            FROM code_user_wallet t1 
            JOIN membership t2 ON t2.member_id = t1.uid 
            WHERE t1.amount > 0 AND t1.uid = ?
            ORDER BY t1.id DESC 
            LIMIT ? OFFSET ?
        `;
        const [results] = await pool.query(query, [customeid, limit, offset]);
        return results;
    } catch (error) {
        console.error('Query error in getCodeUserWalletTransactions:', error);
        throw error;
    }
};

/**
 * Gets total count of code user wallet transactions
 */
const getCodeUserWalletCount = async (pool, customeid) => {
    try {
        const query = `
            SELECT COUNT(*) as total 
            FROM code_user_wallet 
            WHERE amount > 0 AND uid = ?
        `;
        const [rows] = await pool.query(query, [customeid]);
        return rows[0].total;
    } catch (error) {
        console.error('Query error in getCodeUserWalletCount:', error);
        throw error;
    }
};

module.exports = {
    getCodeUserWalletTransactions,
    getCodeUserWalletCount
};