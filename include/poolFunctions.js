async function GetUsersIDPool(db, level, mlmid, type) {
    const res1 = await GetUidsPool(db, mlmid, type);
    let res = [];

    if (level === 1) {
        res = res1;
    } else if (level === 2) {
        res = await getLevelPool2(db, res1, type);
    } else if (level === 3) {
        res = await getLevelPool3(db, res1, type);
    } else if (level === 4) {
        res = await getLevelPool4(db, res1, type);
    } else if (level === 5) {
        res = await getLevelPool5(db, res1, type);
    } else if (level === 6) {
        res = await getLevelPool6(db, res1, type);
    } else if (level === 7) {
        res = await getLevelPool7(db, res1, type);
    } else if (level === 8) {
        res = await getLevelPool8(db, res1, type);
    } else if (level === 9) {
        res = await getLevelPool9(db, res1, type);
    } else if (level === 10) {
        res = await getLevelPool10(db, res1, type);
    }

    return res;
}

async function GetUidsPool(db, uid, type) {
    const [rows] = await db.query(`SELECT * FROM \`${type}\` WHERE parent_id = ? AND \`status\` = 0`, [uid]);
    return rows.map(row => row.uid);
}

async function getLevelPool2(db, res, type) {
    const res2 = [];
    for (const value of res) {
        const res1 = await GetUidsPool(db, value, type);
        res2.push(...res1);
    }
    return res2;
}

async function getLevelPool3(db, resArr, type) {
    const res1 = await getLevelPool2(db, resArr, type);
    const res3 = [];
    for (const value of res1) {
        const res2 = await GetUidsPool(db, value, type);
        res3.push(...res2);
    }
    return [...new Set(res3)];
}

async function getLevelPool4(db, resArr, type) {
    const res1 = await getLevelPool3(db, resArr, type);
    const res3 = [];
    for (const value of res1) {
        const res2 = await GetUidsPool(db, value, type);
        res3.push(...res2);
    }
    return [...new Set(res3)];
}

async function getLevelPool5(db, resArr, type) {
    const res1 = await getLevelPool4(db, resArr, type);
    const res3 = [];
    for (const value of res1) {
        const res2 = await GetUidsPool(db, value, type);
        res3.push(...res2);
    }
    return [...new Set(res3)];
}

async function getLevelPool6(db, resArr, type) {
    const res1 = await getLevelPool5(db, resArr, type);
    const res3 = [];
    for (const value of res1) {
        const res2 = await GetUidsPool(db, value, type);
        res3.push(...res2);
    }
    return [...new Set(res3)];
}

async function getLevelPool7(db, resArr, type) {
    const res1 = await getLevelPool6(db, resArr, type);
    const res3 = [];
    for (const value of res1) {
        const res2 = await GetUidsPool(db, value, type);
        res3.push(...res2);
    }
    return [...new Set(res3)];
}

async function getLevelPool8(db, resArr, type) {
    const res1 = await getLevelPool7(db, resArr, type);
    const res3 = [];
    for (const value of res1) {
        const res2 = await GetUidsPool(db, value, type);
        res3.push(...res2);
    }
    return [...new Set(res3)];
}

async function getLevelPool9(db, resArr, type) {
    const res1 = await getLevelPool8(db, resArr, type);
    const res3 = [];
    for (const value of res1) {
        const res2 = await GetUidsPool(db, value, type);
        res3.push(...res2);
    }
    return [...new Set(res3)];
}

async function getLevelPool10(db, resArr, type) {
    const res1 = await getLevelPool9(db, resArr, type);
    const res3 = [];
    for (const value of res1) {
        const res2 = await GetUidsPool(db, value, type);
        res3.push(...res2);
    }
    return [...new Set(res3)];
}

const getPoolHistory = async (pool, customeid, limit, offset) => {
    try {

        const query = `select t1.*,t1.date as st,t2.* from selfpool_income t1 join membership t2 on t2.member_id = t1.uid where  t1.amount > 0 and  t1.uid=?
            order by t1.id DESC LIMIT ? OFFSET ?  -- Add limit and offset`;
        const [results] = await pool.query(query, [customeid, limit, offset]); // Pass limit and offset
        return results;
    } catch (error) {
        console.error('Query error in Pool two history:', error);
        throw error;
    }
};

const getPoolHistoryCount = async (pool, customeid) => {
    try {
        const query = `SELECT COUNT(*) as total FROM selfpool_income WHERE amount > 0 AND uid = ?`;
        const [rows] = await pool.query(query, [customeid]);
        return rows[0].total; // Access the 'total' property
    } catch (error) {
        console.error('Query error in Pool two history Count:', error);
        throw error;
    }
};

const getPooLevelHistory = async (pool, customeid, limit, offset) => {
    try {

        const query = `select t1.*,t1.date as st,t2.* from autopool_income t1 join membership t2 on t2.member_id = t1.uid where  t1.amount > 0 and  t1.fuid=?
            order by t1.id DESC LIMIT ? OFFSET ?  -- Add limit and offset`;
        const [results] = await pool.query(query, [customeid, limit, offset]); // Pass limit and offset
        return results;
    } catch (error) {
        console.error('Query error in Pool Level history:', error);
        throw error;
    }
};

const getPooLevelHistoryCount = async (pool, customeid) => {
    try {
        const query = `SELECT COUNT(*) as total FROM autopool_income WHERE amount > 0 AND fuid = ?`;
        const [rows] = await pool.query(query, [customeid]);
        return rows[0].total; // Access the 'total' property
    } catch (error) {
        console.error('Query error in Pool Level history Count:', error);
        throw error;
    }
};

//

const getGolbal = async (pool, customeid, limit, offset) => {
    try {

        const query = `select t1.*,t1.date as st,t2.* from global_income t1 join membership t2 on t2.member_id = t1.uid where  t1.amount > 0 and  t1.uid=?
            order by t1.id DESC LIMIT ? OFFSET ?  -- Add limit and offset`;
        const [results] = await pool.query(query, [customeid, limit, offset]); // Pass limit and offset
        return results;
    } catch (error) {
        console.error('Query error in Pool Level history:', error);
        throw error;
    }
};

const getGlobalCount = async (pool, customeid) => {
    try {
        const query = `SELECT COUNT(*) as total FROM global_income WHERE amount > 0 AND uid = ?`;
        const [rows] = await pool.query(query, [customeid]);
        return rows[0].total; // Access the 'total' property
    } catch (error) {
        console.error('Query error in Pool Level history Count:', error);
        throw error;
    }
};


module.exports = {
    GetUsersIDPool,
    getPoolHistory,
    getPoolHistoryCount,
    getPooLevelHistory,
    getPooLevelHistoryCount,
    getGlobalCount,
    getGolbal,
};