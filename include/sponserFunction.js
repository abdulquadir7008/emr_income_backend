const getSponserIncome = async (pool, customeid, limit, offset) => {
    try {

        const query = `select t1.*,t1.date as st,t2.* from sponsor_income t1 join membership t2 on t2.member_id = t1.uid where  t1.amount > 0 and  t1.uid=?
            order by t1.id DESC LIMIT ? OFFSET ?  -- Add limit and offset`;
        const [results] = await pool.query(query, [customeid, limit, offset]); // Pass limit and offset
        return results;
    } catch (error) {
        console.error('Query error in Pool Level history:', error);
        throw error;
    }
};

const getSponserIncomeCount = async (pool, customeid) => {
    try {
        const query = `SELECT COUNT(*) as total FROM sponsor_income WHERE amount > 0 AND uid = ?`;
        const [rows] = await pool.query(query, [customeid]);
        return rows[0].total; // Access the 'total' property
    } catch (error) {
        console.error('Query error in Pool Level history Count:', error);
        throw error;
    }
};

const getRepurchaseIncome = async (pool, customeid, limit, offset) => {
    try {

        const query = `select t1.*,t1.date as st,t2.* from repurchase_income t1 join membership t2 on t2.member_id = t1.uid where  t1.amount > 0 and  t1.uid=?
            order by t1.id DESC LIMIT ? OFFSET ?  -- Add limit and offset`;
        const [results] = await pool.query(query, [customeid, limit, offset]); // Pass limit and offset
        return results;
    } catch (error) {
        console.error('Query error in Pool Level history:', error);
        throw error;
    }
};

const getRepurchaseIncomeCount = async (pool, customeid) => {
    try {
        const query = `SELECT COUNT(*) as total FROM repurchase_income WHERE amount > 0 AND uid = ?`;
        const [rows] = await pool.query(query, [customeid]);
        return rows[0].total; // Access the 'total' property
    } catch (error) {
        console.error('Query error in Pool Level history Count:', error);
        throw error;
    }
};

const getVideos = async (pool, limit, offset) => {
    try {

        const query = `SELECT * FROM video WHERE status = '1' ORDER BY id DESC LIMIT ? OFFSET ?  -- Add limit and offset`;
        const [results] = await pool.query(query, [ limit, offset]); // Pass limit and offset
        return results;
    } catch (error) {
        console.error('Query error in getVideos:', error);
        throw error;
    }
};

const getVideosCount = async (pool) => {
    try {
        const query = `SELECT COUNT(*) as total FROM video WHERE status = '1'`;
        const [rows] = await pool.query(query);
        return rows[0].total; // Access the 'total' property
    } catch (error) {
        console.error('Query error in getVideosCount:', error);
        throw error;
    }
};

module.exports = {
    getSponserIncome,
    getSponserIncomeCount,
    getRepurchaseIncome,
    getRepurchaseIncomeCount,
    getVideos,
    getVideosCount
};