const getPoolTwoTransactions = async (pool, customeid, limit, offset) => {
    try {
        const query = `
            SELECT t1.*, t1.status AS st, t1.date AS sdat, t2.* FROM up_trans_history1 t1 
    JOIN membership t2 ON t2.member_id = t1.uid 
    WHERE t1.amount > 0 AND t1.wal_type = '2' AND t1.uid = ? 
    ORDER BY t1.id DESC 
    LIMIT ? OFFSET ?  -- Add limit and offset
        `;
        const [results] = await pool.query(query, [customeid, limit, offset]); // Pass limit and offset
        return results;
    } catch (error) {
        console.error('Query error in Robotic Wallet:', error);
        throw error;
    }
};

const getPoolTwoTransactionsCount = async (pool, customeid) => {
    try {
        const query = `SELECT COUNT(*) as total FROM up_trans_history1 WHERE amount > 0 AND wal_type = '2' AND uid = ?`;
        const [rows] = await pool.query(query, [customeid]);
        return rows[0].total; // Access the 'total' property
    } catch (error) {
        console.error('Query error in Robotic Wallet:', error);
        throw error;
    }
};


module.exports = { getPoolTwoTransactions, getPoolTwoTransactionsCount};