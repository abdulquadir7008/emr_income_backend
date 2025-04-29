const getBoosterOneIncome = async (pool, customeid, limit, offset) => {
    try {

        const query = `select t1.*,t1.date as st,t2.* from boost1_income t1 join membership t2 on t2.member_id = t1.uid where  t1.amount > 0 and  t1.uid=?
            order by t1.id DESC LIMIT ? OFFSET ?  -- Add limit and offset`;
        const [results] = await pool.query(query, [customeid, limit, offset]); // Pass limit and offset
        return results;
    } catch (error) {
        console.error('Query error in Pool Level history:', error);
        throw error;
    }
};

const getBoosterOneIncomeCount = async (pool, customeid) => {
    try {
        const query = `SELECT COUNT(*) as total FROM boost1_income WHERE amount > 0 AND uid = ?`;
        const [rows] = await pool.query(query, [customeid]);
        return rows[0].total; // Access the 'total' property
    } catch (error) {
        console.error('Query error in Pool Level history Count:', error);
        throw error;
    }
};

const getBoosterOneLevelIncome = async (pool, customeid, limit, offset) => {
    try {

        const query = `select t1.*,t1.date as st,t2.* from boost1_level_income t1 join membership t2 on t2.member_id = t1.fuid where  t1.amount > 0 and  t1.fuid=?
            order by t1.id DESC LIMIT ? OFFSET ?  -- Add limit and offset`;
        const [results] = await pool.query(query, [customeid, limit, offset]); // Pass limit and offset
        return results;
    } catch (error) {
        console.error('Query error in Pool Level history:', error);
        throw error;
    }
};

const getBoosterOneLevelIncomeCount = async (pool, customeid) => {
    try {
        const query = `SELECT COUNT(*) as total FROM boost1_level_income WHERE amount > 0 AND fuid = ?`;
        const [rows] = await pool.query(query, [customeid]);
        return rows[0].total; // Access the 'total' property
    } catch (error) {
        console.error('Query error in Pool Level history Count:', error);
        throw error;
    }
};

const getBoosterTwoHistory = async (pool, customeid, limit, offset) => {
    try {

        const query = `select t1.*,t1.date as st,t2.* from goldboost_income t1 join membership t2 on t2.member_id = t1.uid where  t1.amount > 0 and  t1.uid=?
            order by t1.id DESC LIMIT ? OFFSET ?  -- Add limit and offset`;
        const [results] = await pool.query(query, [customeid, limit, offset]); // Pass limit and offset
        return results;
    } catch (error) {
        console.error('Query error in Pool Level history:', error);
        throw error;
    }
};

const getBoosterTwoHistoryCount = async (pool, customeid) => {
    try {
        const query = `SELECT COUNT(*) as total FROM goldboost_income WHERE amount > 0 AND uid = ?`;
        const [rows] = await pool.query(query, [customeid]);
        return rows[0].total; // Access the 'total' property
    } catch (error) {
        console.error('Query error in Pool Level history Count:', error);
        throw error;
    }
};

//

const getBoosterThreeHistory = async (pool, customeid, limit, offset) => {
    try {

        const query = `select t1.*,t1.date as st,t2.* from diaboost_income t1 join membership t2 on t2.member_id = t1.uid where  t1.amount > 0 and  t1.uid=?
            order by t1.id DESC LIMIT ? OFFSET ?  -- Add limit and offset`;
        const [results] = await pool.query(query, [customeid, limit, offset]); // Pass limit and offset
        return results;
    } catch (error) {
        console.error('Query error in Pool Level history:', error);
        throw error;
    }
};

const getBoosterThreeHistoryCount = async (pool, customeid) => {
    try {
        const query = `SELECT COUNT(*) as total FROM diaboost_income WHERE amount > 0 AND uid = ?`;
        const [rows] = await pool.query(query, [customeid]);
        return rows[0].total; // Access the 'total' property
    } catch (error) {
        console.error('Query error in Pool Level history Count:', error);
        throw error;
    }
};

module.exports = {
    getBoosterOneIncome,
    getBoosterOneIncomeCount,
    getBoosterOneLevelIncome,
    getBoosterOneLevelIncomeCount,
    getBoosterTwoHistory,
    getBoosterTwoHistoryCount,
    getBoosterThreeHistory,
    getBoosterThreeHistoryCount
};