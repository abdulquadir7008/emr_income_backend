const getRankClubIncome = async (pool, customeid, limit, offset) => {
    try {

        const query = `select t1.*,t1.date as st,t2.* from rank_income t1 join membership t2 on t2.member_id = t1.uid where  t1.amount > 0 and  t1.uid=?
            order by t1.id DESC LIMIT ? OFFSET ?  -- Add limit and offset`;
        const [results] = await pool.query(query, [customeid, limit, offset]); // Pass limit and offset
        return results;
    } catch (error) {
        console.error('Query error in Pool Level history:', error);
        throw error;
    }
};

const getRankClubIncomeCount = async (pool, customeid) => {
    try {
        const query = `SELECT COUNT(*) as total FROM rank_income WHERE amount > 0 AND uid = ?`;
        const [rows] = await pool.query(query, [customeid]);
        return rows[0].total; // Access the 'total' property
    } catch (error) {
        console.error('Query error in Pool Level history Count:', error);
        throw error;
    }
};

const getRankClubRoyal = async (pool, customeid, limit, offset) => {
    try {

        const query = `select t1.*,t1.date as st,t2.* from royalty_income t1 join membership t2 on t2.member_id = t1.uid where  t1.amount > 0 and  t1.uid=?
            order by t1.id DESC LIMIT ? OFFSET ?  -- Add limit and offset`;
        const [results] = await pool.query(query, [customeid, limit, offset]); // Pass limit and offset
        return results;
    } catch (error) {
        console.error('Query error in Pool Level history:', error);
        throw error;
    }
};

const getRankClubRoyalCount = async (pool, customeid) => {
    try {
        const query = `SELECT COUNT(*) as total FROM royalty_income WHERE amount > 0 AND uid = ?`;
        const [rows] = await pool.query(query, [customeid]);
        return rows[0].total; // Access the 'total' property
    } catch (error) {
        console.error('Query error in Pool Level history Count:', error);
        throw error;
    }
};


module.exports = {
    getRankClubIncome,
    getRankClubIncomeCount,
    getRankClubRoyal,
    getRankClubRoyalCount
};