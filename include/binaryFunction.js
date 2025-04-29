const GetUids = async (pool, uid) => {
    try {
        const [results] = await pool.query('SELECT uid FROM pairing WHERE parent_id = ?', [uid]);
        return results.map(row => row.uid);
    } catch (error) {
        console.error('Query error in GetUids:', error);
        throw error;
    }
};

const getLevelid = async (pool, uids) => {
    try {
        let all_user1 = [...uids];
        for (let uid of uids) {
            const res1 = await GetUids(pool, uid);
            if (res1.length > 0) {
                all_user1 = all_user1.concat(await getLevelid(pool, res1));
            }
        }
        return all_user1;
    } catch (error) {
        console.error('Query error in getLevelid:', error);
        throw error;
    }
};

const GetUserByPos = async (pool, sponsor_id, position) => {
    try {
        const [results] = await pool.query(
            'SELECT t1.uid FROM pairing t1 LEFT JOIN membership t2 ON t1.parent_id = t2.member_id WHERE t2.member_id = ? AND t1.position = ?',
            [sponsor_id, position]
        );
        if (results.length > 0) {
            const uid = results[0].uid;
            const res1 = [uid];
            const res = await GetUids(pool, uid);
            if (res.length > 0) {
                const res2 = await getLevelid(pool, res);
                return res1.concat(res2);
            } else {
                return res1;
            }
        } else {
            return [];
        }
    } catch (error) {
        console.error('Query error in GetUserByPos:', error);
        throw error;
    }
};
const GetBinaryIncome = async (pool, customeid, limit, offset) => {
    try {
        const query = `
            SELECT t1.*, t1.date as st, t2.* 
            FROM binary_income t1 
            JOIN membership t2 ON t2.member_id = t1.uid 
            WHERE t1.amount > 0 AND t1.uid = ? 
            ORDER BY t1.id DESC
            LIMIT ? OFFSET ?  -- Add limit and offset
        `;
        const [results] = await pool.query(query, [customeid, limit, offset]); // Pass limit and offset
        return results;
    } catch (error) {
        console.error('Query error in GetBinaryIncome:', error);
        throw error;
    }
};

const GetBinaryIncomeCount = async (pool, customeid) => {
    try {
        const query = `
            SELECT COUNT(*) AS count
            FROM binary_income t1
            WHERE t1.amount > 0 AND t1.uid = ?
        `;
        const [rows] = await pool.query(query, [customeid]);
        return rows[0].count; // Access the count property directly
    } catch (error) {
        console.error('Query error in GetBinaryIncomeCount:', error);
        throw error;
    }
};

const GetRoboticIncome = async (pool, customeid, limit, offset) => {
    try {
        const query = `
            SELECT t1.*, t1.date AS dr, t2.* 
            FROM robotic_income t1 
            JOIN membership t2 ON t2.member_id = t1.uid 
            WHERE t1.amount > 0 AND t1.uid = ? 
            ORDER BY t1.id DESC
            LIMIT ? OFFSET ?
        `;
        const [results] = await pool.query(query, [customeid, limit, offset]);
        return results;
    } catch (error) {
        console.error('Query error in GetRoboticIncome:', error);
        throw error;
    }
};


const GetRoboticIncomeCount = async (pool, customeid) => {
    try {
        const query = `
            SELECT COUNT(*) AS count
            FROM robotic_income t1
            WHERE t1.amount > 0 AND t1.uid = ?
        `;
        const [rows] = await pool.query(query, [customeid]);
        return rows[0].count;
    } catch (error) {
        console.error('Query error in GetRoboticIncomeCount:', error);
        throw error;
    }
};

const getTransactions = async (pool, customeid, limit, offset) => {
    try {
        const query = `
            SELECT t1.*, t1.status AS st, t1.date AS sdat, t2.* FROM up_trans_history1 t1 
    JOIN membership t2 ON t2.member_id = t1.uid 
    WHERE t1.amount > 0 AND t1.wal_type = '9' AND t1.uid = ? 
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

const getTransactionsCount = async (pool, customeid) => {
    try {
        const query = `SELECT COUNT(*) as total FROM up_trans_history1 WHERE amount > 0 AND wal_type = '9' AND uid = ?`;
        const [rows] = await pool.query(query, [customeid]);
        return rows[0].total; // Access the 'total' property
    } catch (error) {
        console.error('Query error in Robotic Wallet:', error);
        throw error;
    }
};


module.exports = { GetUids, getLevelid, GetUserByPos,GetBinaryIncome, GetBinaryIncomeCount,GetRoboticIncome, GetRoboticIncomeCount,getTransactions,getTransactionsCount };