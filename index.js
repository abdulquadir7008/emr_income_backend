const express = require('express');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();
const cors = require('cors');
// import { Blob } from '@vercel/blob';
const Jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const moment = require('moment');
const multer = require('multer');
const session = require('express-session');
const path = require('path');


const { GetUids, getLevelid, GetBinaryIncome, GetUserByPos, GetBinaryIncomeCount,
    GetRoboticIncome, GetRoboticIncomeCount,getTransactions,getTransactionsCount  } = require('./include/binaryFunction');

const {
    GetUsersIDPool,
    getPoolHistory,
    getPoolHistoryCount,
    getPooLevelHistory,
    getPooLevelHistoryCount,
    getGlobalCount,
    getGolbal,
} = require('./include/poolFunctions');

const {
    getBoosterOneIncome,
    getBoosterOneIncomeCount,
    getBoosterOneLevelIncome,
    getBoosterOneLevelIncomeCount,
    getBoosterTwoHistory,
    getBoosterTwoHistoryCount,
    getBoosterThreeHistory,
    getBoosterThreeHistoryCount
} = require('./include/boosterFunction');
const {
    getSponserIncome,
    getSponserIncomeCount,
    getRepurchaseIncome,
    getRepurchaseIncomeCount,
    getVideos,
    getVideosCount
} = require('./include/sponserFunction');

const {
    getRankClubIncome,
    getRankClubIncomeCount,
    getRankClubRoyal,
    getRankClubRoyalCount
} = require('./include/rankClubFunction');
const {getCodeUserWalletTransactions, getCodeUserWalletCount} = require('./include/codeIncomeFunction');
const {getPoolTwoTransactionsCount, getPoolTwoTransactions} = require('./include/walletFunction');

const PORT = process.env.PORT || 3000;
const jwtKey = 'e-comm';

const app = express();
app.use(cors());
app.use(express.json());
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);

async function queryDatabase(sql, params) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database query error:', error);
        throw error; // Re-throw the error to be caught by the API handler
    }
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads', // Cloudinary folder name
        format: async (req, file) => 'png', // Change format as needed
        public_id: (req, file) => Date.now() + '-' + file.originalname,
    },
});

const upload = multer({ storage });

app.get('/wallets/:customeid', verifyToken, async (req, res) => {
  const customeid = req.params.customeid;

  try {
    const connection = await pool.getConnection();

    // Combined query using conditional aggregation
    const [walletRows] = await connection.execute(`
            SELECT
                SUM(CASE WHEN table_name = 'main_wallet' AND status = 0 THEN amount ELSE 0 END) AS main_wallet_add,
                SUM(CASE WHEN table_name = 'main_wallet' AND status = 1 THEN amount ELSE 0 END) AS main_wallet_sub,
                SUM(CASE WHEN table_name = 'daily_wallet' AND status = 0 THEN amount ELSE 0 END) AS daily_wallet,
                SUM(CASE WHEN table_name = 'selfpool_wallet' AND status = 0 THEN amount ELSE 0 END) AS selfpool_wallet_add,
                SUM(CASE WHEN table_name = 'selfpool_wallet' AND status = 1 THEN amount ELSE 0 END) AS selfpool_wallet_sub,
                SUM(CASE WHEN table_name = 'booster1_wallet' AND status = 0 THEN amount ELSE 0 END) AS booster1_wallet_add,
                SUM(CASE WHEN table_name = 'booster1_wallet' AND status = 1 THEN amount ELSE 0 END) AS booster1_wallet_sub,
                SUM(CASE WHEN table_name = 'gold_wallet' AND status = 0 THEN amount ELSE 0 END) AS gold_wallet_add,
                SUM(CASE WHEN table_name = 'gold_wallet' AND status = 1 THEN amount ELSE 0 END) AS gold_wallet_sub,
                SUM(CASE WHEN table_name = 'diamond_wallet' AND status = 0 THEN amount ELSE 0 END) AS diamond_wallet_add,
                SUM(CASE WHEN table_name = 'diamond_wallet' AND status = 1 THEN amount ELSE 0 END) AS diamond_wallet_sub,
                SUM(CASE WHEN table_name = 'robotic_wallet' AND status = 0 THEN amount ELSE 0 END) AS robotic_wallet_add,
                SUM(CASE WHEN table_name = 'robotic_wallet' AND status = 1 THEN amount ELSE 0 END) AS robotic_wallet_sub,
                SUM(CASE WHEN table_name = 'binary_income' AND status = 0 THEN amount ELSE 0 END) AS binary_income,
                SUM(CASE WHEN table_name = 'sponsor_income' AND status = 0 THEN amount ELSE 0 END) AS sponsor_income,
                SUM(CASE WHEN table_name = 'selfpool_income' AND status = 0 THEN amount ELSE 0 END) AS selfpool_income,
                SUM(CASE WHEN table_name = 'autopool_income' AND status = 0 THEN amount ELSE 0 END) AS autopool_income,
                SUM(CASE WHEN table_name = 'boost1_income' AND status = 0 THEN amount ELSE 0 END) AS boost1_income,
                SUM(CASE WHEN table_name = 'boost1_level_income' AND status = 0 THEN amount ELSE 0 END) AS boost1_level_income,
                SUM(CASE WHEN table_name = 'goldboost_income' AND status = 0 THEN amount ELSE 0 END) AS goldboost_income,
                SUM(CASE WHEN table_name = 'diaboost_income' AND status = 0 THEN amount ELSE 0 END) AS diaboost_income,
                SUM(CASE WHEN table_name = 'code_user_wallet' AND status = 0 THEN amount ELSE 0 END) AS code_user_wallet,
                SUM(CASE WHEN table_name = 'repurchase_income' AND status = 0 THEN amount ELSE 0 END) AS repurchase_income,
                SUM(CASE WHEN table_name = 'robotic_income' AND status = 0 THEN amount ELSE 0 END) AS robotic_income_add,
                SUM(CASE WHEN table_name = 'robotic_income' AND status = 1 THEN amount ELSE 0 END) AS robotic_income_sub,
                SUM(CASE WHEN table_name = 'rank_income' AND status = 0 THEN amount ELSE 0 END) AS rank_income,
                SUM(CASE WHEN table_name = 'royalty_income' AND status = 0 THEN amount ELSE 0 END) AS royalty_income,
                SUM(CASE WHEN table_name = 'global_income' AND status = 0 THEN amount ELSE 0 END) AS global_income
            FROM (
                SELECT 'main_wallet' AS table_name, amount, status FROM main_wallet WHERE uid = ?
                UNION ALL
                SELECT 'daily_wallet', amount, status FROM daily_wallet WHERE uid = ?
                UNION ALL
                SELECT 'selfpool_wallet', amount, status FROM selfpool_wallet WHERE uid = ?
                UNION ALL
                SELECT 'booster1_wallet', amount, status FROM booster1_wallet WHERE uid = ?
                UNION ALL
                SELECT 'gold_wallet', amount, status FROM gold_wallet WHERE uid = ?
                UNION ALL
                SELECT 'diamond_wallet', amount, status FROM diamond_wallet WHERE uid = ?
                UNION ALL
                SELECT 'robotic_wallet', amount, status FROM robotic_wallet WHERE uid = ?
                UNION ALL
                SELECT 'binary_income', amount, status FROM binary_income WHERE uid = ?
                UNION ALL
                SELECT 'sponsor_income', amount, status FROM sponsor_income WHERE uid = ?
                UNION ALL
                SELECT 'selfpool_income', amount, status FROM selfpool_income WHERE uid = ?
                UNION ALL
                SELECT 'autopool_income', amount, status FROM autopool_income WHERE uid = ?
                UNION ALL
                SELECT 'boost1_income', amount, status FROM boost1_income WHERE uid = ?
                UNION ALL
                SELECT 'boost1_level_income', amount, status FROM boost1_level_income WHERE uid = ?
                UNION ALL
                SELECT 'goldboost_income', amount, status FROM goldboost_income WHERE uid = ?
                UNION ALL
                SELECT 'diaboost_income', amount, status FROM diaboost_income WHERE uid = ?
                UNION ALL
                SELECT 'code_user_wallet', amount, status FROM code_user_wallet WHERE uid = ?
                UNION ALL
                SELECT 'repurchase_income', amount, status FROM repurchase_income WHERE uid = ?
                UNION ALL
                SELECT 'robotic_income', amount, status FROM robotic_income WHERE uid = ?
                UNION ALL
                SELECT 'rank_income', amount, status FROM rank_income WHERE uid = ?
                UNION ALL
                SELECT 'royalty_income', amount, status FROM royalty_income WHERE uid = ?
                UNION ALL
                SELECT 'global_income', amount, status FROM global_income WHERE uid = ?
            ) AS wallet_data;
        `, Array(21).fill(customeid)); // Pass customeid 21 times


    const walletData = walletRows[0];

    // Ad View Wallet (separate query)
    const [adViewRows] = await connection.execute(
        "SELECT wallet FROM ad_view_wallet WHERE user_id=?",
        [customeid]
    );
    const adViewWallet = adViewRows[0]?.wallet || 0;

    connection.release();

    const formatNumber = (number) => {
      return parseFloat(number || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    res.json({
      mainWallet: formatNumber(walletData.main_wallet_add - walletData.main_wallet_sub),
      dailyWallet: formatNumber(walletData.daily_wallet),
      selfPoolWallet: formatNumber(walletData.selfpool_wallet_add - walletData.selfpool_wallet_sub),
      booster1Wallet: formatNumber(walletData.booster1_wallet_add - walletData.booster1_wallet_sub),
      goldWallet: formatNumber(walletData.gold_wallet_add - walletData.gold_wallet_sub),
      diamondWallet: formatNumber(walletData.diamond_wallet_add - walletData.diamond_wallet_sub),
      roboticWallet: formatNumber(walletData.robotic_wallet_add - walletData.robotic_wallet_sub),
      binaryIncome: formatNumber(walletData.binary_income),
      sponsorIncome: formatNumber(walletData.sponsor_income),
      selfPoolIncome: formatNumber(walletData.selfpool_income),
      autoPoolIncome: formatNumber(walletData.autopool_income),
      boost1Income: formatNumber(walletData.boost1_income),
      boost1LevelIncome: formatNumber(walletData.boost1_level_income),
      goldBoostIncome: formatNumber(walletData.goldboost_income),
      diaBoostIncome: formatNumber(walletData.diaboost_income),
      codeUserWallet: formatNumber(walletData.code_user_wallet),
      repurchaseIncome: formatNumber(walletData.repurchase_income),
      roboticIncome: formatNumber(walletData.robotic_income_add - walletData.robotic_income_sub),
      rankIncome: formatNumber(walletData.rank_income),
      royaltyIncome: formatNumber(walletData.royalty_income),
      globalIncome: formatNumber(walletData.global_income),
      adViewWallet: formatNumber(adViewWallet)  // Include the adViewWallet
    });

  } catch (error) {
    console.error("Error fetching wallet data:", error);
    res.status(500).json({ error: 'Failed to fetch wallet data' });
  }
});

app.get('/users/:sponsor_id/:position', verifyToken, async (req, res) => {
    const { sponsor_id, position } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;
    let i = offset + 1;

    try {
        const res1 = await GetUserByPos(pool, sponsor_id, position);
        let query;
        if (res1.length > 0) {
            const res2 = res1.join(',');
            query = `SELECT t2.* FROM membership t2 WHERE t2.member_id IN (${res2}) ORDER BY t2.member_id DESC LIMIT ${limit} OFFSET ${offset}`;
        } else {
            query = `SELECT t2.* FROM membership t2 WHERE t2.member_id IN ('') ORDER BY t2.member_id DESC LIMIT ${limit} OFFSET ${offset}`;
        }
        const [result] = await pool.query(query);

        const response = result.map(row => ({
            id: i++,
            userid: row.userid,
            name: `${row.fname} ${row.lname}`,
            status: row.binary_status == 1 ? '2000_plan' : row.binary_status == 2 ? '3000_plan' : 'In-Active',
            date: row.date
        }));

        const totalUsersQuery = res1.length > 0
            ? `SELECT COUNT(*) AS total FROM membership t2 WHERE t2.member_id IN (${res1.join(',')})`
            : `SELECT COUNT(*) AS total FROM membership t2 WHERE t2.member_id IN ('')`;

        const [[{ total }]] = await pool.query(totalUsersQuery);

        res.send({
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalUsers: total,
            users: response
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error occurred');
    }
});

app.get('/binary-income/:customeid', verifyToken, async (req, res) => {
    const { customeid } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 13;

    try {
        const offset = (page - 1) * limit;

        const results = await GetBinaryIncome(pool, customeid, limit, offset);
        const totalCount = await GetBinaryIncomeCount(pool, customeid); // Get total count

        const totalPages = Math.ceil(totalCount / limit);

        const formattedResults = results.map((row, i) => ({
            id: offset + i + 1,
            userid: row.userid,
            name: `${row.fname} ${row.lname}`,
            amount: row.amount,
            date: row.st
        }));

        res.send({
            totalPages,
            currentPage: page,
            totalItems: totalCount,
            items: formattedResults
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error occurred');
    }
});

app.get('/robotic-income/:customeid', verifyToken, async (req, res) => {
    const { customeid } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;

    try {
        const offset = (page - 1) * limit;

        const results = await GetRoboticIncome(pool, customeid, limit, offset);
        const totalCount = await GetRoboticIncomeCount(pool, customeid);

        const totalPages = Math.ceil(totalCount / limit);

        const formattedResults = results.map((row, i) => ({
            id: offset + i + 1,
            userid: row.userid,
            name: `${row.fname} ${row.lname}`,
            amount: row.amount,
            date: row.dr // Use the alias 'dr'
        }));

        res.send({
            totalPages,
            currentPage: page,
            totalItems: totalCount,
            items: formattedResults
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error occurred');
    }
});

app.post('/robo_add/:member_id', verifyToken, upload.single('image'), async (req, res) => {
    const member_id = req.params.member_id;

    if (member_id) {
        const amount = req.body.amount;
        const txn_id = req.body.txn_id;
        let imagePath = null;

        if (req.file) {
            imagePath = req.file.path; // Cloudinary returns a URL
        }

        try {
            const [result] = await pool.query(
                `INSERT INTO up_trans_history1 (uid, amount, txn_sc, txn_id, date, status, wal_type) VALUES (?, ?, ?, ?, NOW(), '1', '9')`,
                [member_id, amount, imagePath, txn_id]
            );

            res.json({ message: 'Success! Request Sent Successfully.', imageUrl: imagePath });
        } catch (err) {
            console.error("Database Error:", err);
            res.status(500).send('Database error');
        }
    } else {
        res.status(400).send('Invalid member_id');
    }
});

// Robotic Wallet Transaction list


app.get('/transactions/:customeid',verifyToken, async (req, res) => {
    const { customeid } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const offset = (page - 1) * limit;

        const results = await getTransactions(pool, customeid, limit, offset);
        const totalCount = await getTransactionsCount(pool, customeid);

        const totalPages = Math.ceil(totalCount / limit);


        const formattedResults = results.map((row, index) => ({
            id: offset + index + 1,
            userid: `${row.userid} (${row.fname} ${row.lname})`,
            txn_id: row.txn_id,
            txn_sc: row.txn_sc,
            amount: row.amount,
            sdat: row.sdat,
            status: row.st === '0' ? 'Pending' : row.st === '2' ? 'Rejected' : 'Approved',
        }));

        res.send({
            totalPages,
            currentPage: page,
            totalItems: totalCount,
            items: formattedResults
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error occurred');
    }
});

// Pool 1 Team API

app.get('/api/users/:customeid',verifyToken, async (req, res) => {
    const customeid = req.params.customeid;

    try {
        const [membershipRows] = await pool.query(
            'SELECT t1.* FROM membership t1 WHERE t1.member_id = ?',
            [customeid]
        );
        const cffrt = membershipRows[0];

        if (!cffrt) {
            return res.status(404).json({ error: 'User not found' });
        }

        const [childCounterRows] = await pool.query(
            'SELECT t1.*, t1.id AS idd FROM child_counter_10 t1 WHERE t1.uid LIKE ?',
            [`${customeid}%`]
        );

        const users = childCounterRows.map((row, index) => ({
            value: row.uid,
            label: `${cffrt.fname} ${cffrt.lname} (${cffrt.userid}) ${index + 1}`,
        }));

        res.json(users);
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/api/level-data/:icd',verifyToken, async (req, res) => {
    const icd = req.params.icd;

    try {
        if (!icd || icd === '0') {
            return res.json([]); // Return empty array if icd is missing or '0'
        }

        const tableData = [];

        for (let i = 1; i < 7; i++) {
            const [row1] = await pool.query(
                'SELECT t1.* FROM child_counter_10 t1 WHERE t1.uid = ?',
                [icd]
            );
            const row = row1[0];

            if (!row) {
                continue; // Skip if user not found
            }

            const integerPart = Math.floor(icd);

            let amt = 0;
            if (i === 1) amt = 4;
            else if (i === 2) amt = 8;
            else if (i === 3 || i === 4) amt = 16;
            else if (i === 5) amt = 32;
            else if (i === 6) amt = 128;

            let count = 0;
            if (i === 1) count = 2;
            else if (i === 2) count = 4;
            else if (i === 3) count = 8;
            else if (i === 4) count = 16;
            else if (i === 5) count = 32;
            else if (i === 6) count = 64;


            const [slotCountRows] = await pool.query(
                'SELECT * FROM robotic_income WHERE uid = ? AND fuid = ? AND amount = ?',
                [integerPart, row.id, amt]
            );
            const slotCount = slotCountRows.length;

            tableData.push({
                srNo: i,
                level: i,
                count: count,
                amount: amt,
                status: slotCount > 0 ? 'Completed' : 'Not-Completed',
            });
        }

        res.json(tableData);
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//  Pool 2 API

app.get('/api/pooltwoteam/:customeid',verifyToken, async (req, res) => {
    const customeid = req.params.customeid;

    try {
        const [membershipRows] = await pool.query(
            'SELECT t1.* FROM membership t1 WHERE t1.member_id = ?',
            [customeid]
        );
        const cffrt = membershipRows[0];

        if (!cffrt) {
            return res.status(404).json({ error: 'User not found' });
        }

        const [childCounterRows] = await pool.query(
            'SELECT t1.*, t1.id AS idd FROM child_counter_1 t1 WHERE t1.uid LIKE ?',
            [`${customeid}%`]
        );

        const users = childCounterRows.map((row, index) => ({
            value: row.uid,
            label: `${cffrt.fname} ${cffrt.lname} (${cffrt.userid}) ${index + 1}`,
        }));

        res.json(users);
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/pooltwodata/:icd',verifyToken, async (req, res) => {
    const icd = req.params.icd;

    try {
        if (!icd || icd === '0') {
            return res.json([]);
        }

        const tableData = [];

        for (let i = 1; i <= 11; i++) {
            const [row1] = await pool.query('SELECT t1.* FROM child_counter_1 t1 WHERE t1.uid = ?', [icd]);
            const row = row1[0];

            if (!row) {
                continue;
            }

            const resUids = await GetUsersIDPool(pool, i, icd, 'pairing_1');
            const count = resUids.length;
            const integerPart = Math.floor(icd);

            let amt = 0;
            if (i === 1) amt = 50;
            else if (i === 2) amt = 100;
            else if (i === 3) amt = 200;
            else if (i === 4) amt = 400;
            else if (i === 5) amt = 800;
            else if (i === 6) amt = 525;
            else if (i === 7) amt = 375;
            else if (i === 8) amt = 750;
            else if (i === 9) amt = 1500;
            else if (i === 10) amt = 2325;
            else if (i === 11) amt = 3675;

            const [slotCountRows] = await pool.query('SELECT * FROM `selfpool_income` WHERE `uid` = ? AND `fuid` = ? AND `amount` = ?', [integerPart, row.id, amt]);
            const slotCount = slotCountRows.length;

            tableData.push({
                level: i,
                count: count,
                amount: amt,
                status: slotCount > 0 ? 'Completed' : 'Not-Completed',
            });
        }

        res.json(tableData);
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/poolhistory/:customeid',verifyToken, async (req, res) => {
    const { customeid } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const offset = (page - 1) * limit;

        const results = await getPoolHistory(pool, customeid, limit, offset);
        const totalCount = await getPoolHistoryCount(pool, customeid);

        const totalPages = Math.ceil(totalCount / limit);


        const formattedResults = results.map((row, index) => ({
            id: offset + index + 1,
            userid: row.userid,
            fname: `${row.fname} ${row.lname}`,
            amount: row.amount,
            st: row.st
        }));

        res.send({
            totalPages,
            currentPage: page,
            totalItems: totalCount,
            items: formattedResults
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error occurred');
    }
});

app.get('/poollevelhistory/:customeid',verifyToken, async (req, res) => {
    const { customeid } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const offset = (page - 1) * limit;

        const results = await getPooLevelHistory(pool, customeid, limit, offset);
        const totalCount = await getPooLevelHistoryCount(pool, customeid);

        const totalPages = Math.ceil(totalCount / limit);


        const formattedResults = results.map((row, index) => ({
            id: offset + index + 1,
            userid: row.userid,
            fname: `${row.fname} ${row.lname}`,
            amount: row.amount,
            st: row.st
        }));

        res.send({
            totalPages,
            currentPage: page,
            totalItems: totalCount,
            items: formattedResults
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error occurred');
    }
});

app.get('/global/:customeid',verifyToken, async (req, res) => {
    const { customeid } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const offset = (page - 1) * limit;

        const results = await getGolbal(pool, customeid, limit, offset);
        const totalCount = await getGlobalCount(pool, customeid);

        const totalPages = Math.ceil(totalCount / limit);


        const formattedResults = results.map((row, index) => ({
            id: offset + index + 1,
            userid: row.userid,
            fname: `${row.fname} ${row.lname}`,
            amount: row.amount,
            st: row.st
        }));

        res.send({
            totalPages,
            currentPage: page,
            totalItems: totalCount,
            items: formattedResults
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error occurred');
    }
});

// Booster Team

app.get('/api/boosterteamone/:customeid',verifyToken, async (req, res) => {
    const customeid = req.params.customeid;

    try {
        const [membershipRows] = await pool.query(
            'SELECT t1.* FROM membership t1 WHERE t1.member_id = ?',
            [customeid]
        );
        const cffrt = membershipRows[0];

        if (!cffrt) {
            return res.status(404).json({ error: 'User not found' });
        }

        const [childCounterRows] = await pool.query(
            'SELECT t1.*, t1.id AS idd FROM child_counter_4 t1 WHERE t1.uid LIKE ?',
            [`${customeid}%`]
        );

        const users = childCounterRows.map((row, index) => ({
            value: row.uid,
            label: `${cffrt.fname} ${cffrt.lname} (${cffrt.userid}) ${index + 1}`,
        }));

        res.json(users);
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/boosteronehistory/:icd',verifyToken, async (req, res) => {
    try {
        const icd = req.params.icd;
        if (icd !== '0') {
            const brnadSQL = 'SELECT t1.* FROM child_counter_4 t1 WHERE t1.uid = ?';
            const results = await queryDatabase(brnadSQL, [icd]);

            const responseData = results.map((row, index) => ({
                index: index + 1,
                b_value: 'B1',
                count: row.count,
                fixed_value: 400,
                status: row.ac === 1 ? 'Completed' : 'Not Complete',
            }));
            res.json(responseData);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/boosterteamtwo/:customeid',verifyToken, async (req, res) => {
    const customeid = req.params.customeid;

    try {
        const [membershipRows] = await pool.query(
            'SELECT t1.* FROM membership t1 WHERE t1.member_id = ?',
            [customeid]
        );
        const cffrt = membershipRows[0];

        if (!cffrt) {
            return res.status(404).json({ error: 'User not found' });
        }

        const [childCounterRows] = await pool.query(
            'SELECT t1.*, t1.id AS idd FROM child_counter_5 t1 WHERE t1.uid LIKE ?',
            [`${customeid}%`]
        );

        const users = childCounterRows.map((row, index) => ({
            value: row.uid,
            label: `${cffrt.fname} ${cffrt.lname} (${cffrt.userid}) ${index + 1}`,
        }));

        res.json(users);
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/boostertwohistory/:icd',verifyToken, async (req, res) => {
    try {
        const icd = req.params.icd;
        if (icd !== '0') {
            const brnadSQL = 'SELECT t1.* FROM child_counter_5 t1 WHERE t1.uid = ?';
            const results = await queryDatabase(brnadSQL, [icd]);

            const responseData = results.map((row, index) => ({
                index: index + 1,
                b_value: 'B2',
                count: row.count,
                fixed_value: 800,
                status: row.ac === 1 ? 'Completed' : 'Not Complete',
            }));
            res.json(responseData);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/boosterteamthree/:customeid',verifyToken, async (req, res) => {
    const customeid = req.params.customeid;

    try {
        const [membershipRows] = await pool.query(
            'SELECT t1.* FROM membership t1 WHERE t1.member_id = ?',
            [customeid]
        );
        const cffrt = membershipRows[0];

        if (!cffrt) {
            return res.status(404).json({ error: 'User not found' });
        }

        const [childCounterRows] = await pool.query(
            'SELECT t1.*, t1.id AS idd FROM child_counter_6 t1 WHERE t1.uid LIKE ?',
            [`${customeid}%`]
        );

        const users = childCounterRows.map((row, index) => ({
            value: row.uid,
            label: `${cffrt.fname} ${cffrt.lname} (${cffrt.userid}) ${index + 1}`,
        }));

        res.json(users);
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/boosterthreehistory/:icd',verifyToken, async (req, res) => {
    try {
        const icd = req.params.icd;
        if (icd !== '0') {
            const brnadSQL = 'SELECT t1.* FROM child_counter_6 t1 WHERE t1.uid = ?';
            const results = await queryDatabase(brnadSQL, [icd]);

            const responseData = results.map((row, index) => ({
                index: index + 1,
                b_value: 'B3',
                count: row.count,
                fixed_value: 1600,
                status: row.ac === 1 ? 'Completed' : 'Not Complete',
            }));
            res.json(responseData);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.get('/api/boosterteamfour/:customeid',verifyToken, async (req, res) => {
    const customeid = req.params.customeid;

    try {
        const [membershipRows] = await pool.query(
            'SELECT t1.* FROM membership t1 WHERE t1.member_id = ?',
            [customeid]
        );
        const cffrt = membershipRows[0];

        if (!cffrt) {
            return res.status(404).json({ error: 'User not found' });
        }

        const [childCounterRows] = await pool.query(
            'SELECT t1.*, t1.id AS idd FROM child_counter_7 t1 WHERE t1.uid LIKE ?',
            [`${customeid}%`]
        );

        const users = childCounterRows.map((row, index) => ({
            value: row.uid,
            label: `${cffrt.fname} ${cffrt.lname} (${cffrt.userid}) ${index + 1}`,
        }));

        res.json(users);
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/boosterfourhistory/:icd',verifyToken, async (req, res) => {
    try {
        const icd = req.params.icd;
        if (icd !== '0') {
            const brnadSQL = 'SELECT t1.* FROM child_counter_7 t1 WHERE t1.uid = ?';
            const results = await queryDatabase(brnadSQL, [icd]);

            const responseData = results.map((row, index) => ({
                index: index + 1,
                b_value: 'B1',
                count: row.count,
                fixed_value: 3200,
                status: row.ac === 1 ? 'Completed' : 'Not Complete',
            }));
            res.json(responseData);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/boosterteamfive/:customeid',verifyToken, async (req, res) => {
    const customeid = req.params.customeid;

    try {
        const [membershipRows] = await pool.query(
            'SELECT t1.* FROM membership t1 WHERE t1.member_id = ?',
            [customeid]
        );
        const cffrt = membershipRows[0];

        if (!cffrt) {
            return res.status(404).json({ error: 'User not found' });
        }

        const [childCounterRows] = await pool.query(
            'SELECT t1.*, t1.id AS idd FROM child_counter_8 t1 WHERE t1.uid LIKE ?',
            [`${customeid}%`]
        );

        const users = childCounterRows.map((row, index) => ({
            value: row.uid,
            label: `${cffrt.fname} ${cffrt.lname} (${cffrt.userid}) ${index + 1}`,
        }));

        res.json(users);
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/boosterfivehistory/:icd',verifyToken, async (req, res) => {
    try {
        const icd = req.params.icd;
        if (icd !== '0') {
            const brnadSQL = 'SELECT t1.* FROM child_counter_8 t1 WHERE t1.uid = ?';
            const results = await queryDatabase(brnadSQL, [icd]);

            const responseData = results.map((row, index) => ({
                index: index + 1,
                b_value: 'B1',
                count: row.count,
                fixed_value: 6400,
                status: row.ac === 1 ? 'Completed' : 'Not Complete',
            }));
            res.json(responseData);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.get('/api/boosterteamsix/:customeid',verifyToken, async (req, res) => {
    const customeid = req.params.customeid;

    try {
        const [membershipRows] = await pool.query(
            'SELECT t1.* FROM membership t1 WHERE t1.member_id = ?',
            [customeid]
        );
        const cffrt = membershipRows[0];

        if (!cffrt) {
            return res.status(404).json({ error: 'User not found' });
        }

        const [childCounterRows] = await pool.query(
            'SELECT t1.*, t1.id AS idd FROM child_counter_9 t1 WHERE t1.uid LIKE ?',
            [`${customeid}%`]
        );

        const users = childCounterRows.map((row, index) => ({
            value: row.uid,
            label: `${cffrt.fname} ${cffrt.lname} (${cffrt.userid}) ${index + 1}`,
        }));

        res.json(users);
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/boostersixhistory/:icd',verifyToken, async (req, res) => {
    try {
        const icd = req.params.icd;
        if (icd !== '0') {
            const brnadSQL = 'SELECT t1.* FROM child_counter_9 t1 WHERE t1.uid = ?';
            const results = await queryDatabase(brnadSQL, [icd]);

            const responseData = results.map((row, index) => ({
                index: index + 1,
                b_value: 'B1',
                count: row.count,
                fixed_value: 12800,
                status: row.ac === 1 ? 'Completed' : 'Not Complete',
            }));
            res.json(responseData);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/booster2team/:customeid',verifyToken, async (req, res) => {
    const customeid = req.params.customeid;

    try {
        const [membershipRows] = await pool.query(
            'SELECT t1.* FROM membership t1 WHERE t1.member_id = ?',
            [customeid]
        );
        const cffrt = membershipRows[0];

        if (!cffrt) {
            return res.status(404).json({ error: 'User not found' });
        }

        const [childCounterRows] = await pool.query(
            'SELECT t1.*, t1.id AS idd FROM child_counter_2 t1 WHERE t1.uid LIKE ?',
            [`${customeid}%`]
        );

        const users = childCounterRows.map((row, index) => ({
            value: row.uid,
            label: `${cffrt.fname} ${cffrt.lname} (${cffrt.userid}) ${index + 1}`,
        }));

        res.json(users);
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/booster2teamhistory/:icd',verifyToken, async (req, res) => {
    try {
        const icd = req.params.icd;
        if (icd !== '0') {
            const brnadSQL = 'SELECT t1.* FROM child_counter_2 t1 WHERE t1.uid = ?';
            const results = await queryDatabase(brnadSQL, [icd]);

            const responseData = results.map((row, index) => ({
                index: index + 1,
                b_value: 'Booste 2',
                count: row.count,
                fixed_value: 1500,
                status: row.ac === 1 ? 'Completed' : 'Not Complete',
            }));
            res.json(responseData);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.get('/api/booster3team/:customeid',verifyToken, async (req, res) => {
    const customeid = req.params.customeid;

    try {
        const [membershipRows] = await pool.query(
            'SELECT t1.* FROM membership t1 WHERE t1.member_id = ?',
            [customeid]
        );
        const cffrt = membershipRows[0];

        if (!cffrt) {
            return res.status(404).json({ error: 'User not found' });
        }

        const [childCounterRows] = await pool.query(
            'SELECT t1.*, t1.id AS idd FROM child_counter_3 t1 WHERE t1.uid LIKE ?',
            [`${customeid}%`]
        );

        const users = childCounterRows.map((row, index) => ({
            value: row.uid,
            label: `${cffrt.fname} ${cffrt.lname} (${cffrt.userid}) ${index + 1}`,
        }));

        res.json(users);
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/booster3teamhistory/:icd',verifyToken, async (req, res) => {
    try {
        const icd = req.params.icd;
        if (icd !== '0') {
            const brnadSQL = 'SELECT t1.* FROM child_counter_3 t1 WHERE t1.uid = ?';
            const results = await queryDatabase(brnadSQL, [icd]);

            const responseData = results.map((row, index) => ({
                index: index + 1,
                b_value: 'Booste 3',
                count: row.count,
                fixed_value: 3000,
                status: row.ac === 1 ? 'Completed' : 'Not Complete',
            }));
            res.json(responseData);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/boosteroneincome/:customeid',verifyToken, async (req, res) => {
    const { customeid } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const offset = (page - 1) * limit;

        const results = await getBoosterOneIncome(pool, customeid, limit, offset);
        const totalCount = await getBoosterOneIncomeCount(pool, customeid);

        const totalPages = Math.ceil(totalCount / limit);


        const formattedResults = results.map((row, index) => ({
            id: offset + index + 1,
            userid: row.userid,
            fname: `${row.fname} ${row.lname}`,
            amount: row.amount,
            st: row.st
        }));

        res.send({
            totalPages,
            currentPage: page,
            totalItems: totalCount,
            items: formattedResults
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error occurred');
    }
});

app.get('/boosteronelevelincome/:customeid',verifyToken, async (req, res) => {
    const { customeid } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const offset = (page - 1) * limit;

        const results = await getBoosterOneLevelIncome(pool, customeid, limit, offset);
        const totalCount = await getBoosterOneLevelIncomeCount(pool, customeid);

        const totalPages = Math.ceil(totalCount / limit);


        const formattedResults = results.map((row, index) => ({
            id: offset + index + 1,
            userid: row.userid,
            fname: `${row.fname} ${row.lname}`,
            amount: row.amount,
            st: row.st
        }));

        res.send({
            totalPages,
            currentPage: page,
            totalItems: totalCount,
            items: formattedResults
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error occurred');
    }
});

app.get('/boostertwohis/:customeid',verifyToken, async (req, res) => {
    const { customeid } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const offset = (page - 1) * limit;

        const results = await getBoosterTwoHistory(pool, customeid, limit, offset);
        const totalCount = await getBoosterTwoHistoryCount(pool, customeid);

        const totalPages = Math.ceil(totalCount / limit);


        const formattedResults = results.map((row, index) => ({
            id: offset + index + 1,
            userid: row.userid,
            fname: `${row.fname} ${row.lname}`,
            amount: row.amount,
            st: row.st
        }));

        res.send({
            totalPages,
            currentPage: page,
            totalItems: totalCount,
            items: formattedResults
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error occurred');
    }
});

app.get('/boosterthreehist/:customeid',verifyToken, async (req, res) => {
    const { customeid } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const offset = (page - 1) * limit;

        const results = await getBoosterThreeHistory(pool, customeid, limit, offset);
        const totalCount = await getBoosterThreeHistoryCount(pool, customeid);

        const totalPages = Math.ceil(totalCount / limit);


        const formattedResults = results.map((row, index) => ({
            id: offset + index + 1,
            userid: row.userid,
            fname: `${row.fname} ${row.lname}`,
            amount: row.amount,
            st: row.st
        }));

        res.send({
            totalPages,
            currentPage: page,
            totalItems: totalCount,
            items: formattedResults
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error occurred');
    }
});

//Other Income

app.get('/sponserIncome/:customeid', verifyToken, async (req, res) => {
    const { customeid } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const offset = (page - 1) * limit;
        const results = await getSponserIncome(pool, customeid, limit, offset);
        const totalCount = await getSponserIncomeCount(pool, customeid);
        const totalPages = Math.ceil(totalCount / limit);

        const formattedResults = [];
        for (const row of results) {
            const membershipSQL = `SELECT * FROM membership WHERE member_id = ?`;
            const [membershipResults] = await pool.query(membershipSQL, [row.fuid]);

            if (membershipResults.length > 0) {
                const member = membershipResults[0];

                formattedResults.push({
                    id: offset + formattedResults.length + 1,
                    userid: member.userid,
                    fname: `${member.fname} ${member.lname}`,
                    amount: row.amount,
                    st: row.st,
                });
            }
        }

        res.send({
            totalPages,
            currentPage: page,
            totalItems: totalCount,
            items: formattedResults,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error occurred');
    }
});

app.get('/repurchaseIncome/:customeid',verifyToken, async (req, res) => {
    const { customeid } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const offset = (page - 1) * limit;

        const results = await getRepurchaseIncome(pool, customeid, limit, offset);
        const totalCount = await getRepurchaseIncomeCount(pool, customeid);

        const totalPages = Math.ceil(totalCount / limit);


        const formattedResults = results.map((row, index) => ({
            id: offset + index + 1,
            userid: row.userid,
            fname: `${row.fname} ${row.lname}`,
            amount: row.amount,
            st: row.st
        }));

        res.send({
            totalPages,
            currentPage: page,
            totalItems: totalCount,
            items: formattedResults
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error occurred');
    }
});

app.get('/videos',verifyToken, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const offset = (page - 1) * limit;

        const results = await getVideos(pool,limit,offset);
        const totalCount = await getVideosCount(pool);

        const totalPages = Math.ceil(totalCount / limit);

        const formattedResults = results.map((video) => {
            let imageUrl = 'https://emrmarketing.in/images/emr-cover.jpg';
            let videopath = '';
            if (video.image2) {
                imageUrl = `https://emrmarketing.in/uploads/video/${video.image2}`;
            }
            if (video.video) {
                videopath = `https://emrmarketing.in/uploads/video/${video.video}`;
            }

            return {
                id: video.id,
                title: video.title,
                video: `https://emrmarketing.in/uploads/video/${video.video}`,
                video_link: video.video_link,
                sortorder: video.sortorder,
                create_date: video.create_date,
                status: video.status,
                seo_keyword: video.seo_keyword,
                image: imageUrl,
            };
        });

        res.send({
            totalPages,
            currentPage: page,
            totalItems: totalCount,
            items: formattedResults,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error occurred');
    }
});

app.get('/process-video-view/:customeid/:video_id',verifyToken, async (req, res) => { // Use route parameters
    const { customeid, video_id } = req.params; // Get parameters from route

    if (!customeid || !video_id) {
        return res.status(400).json({ error: 'Missing customeid or video_id' });
    }

    try {
        const [walletResult] = await pool.query("SELECT * FROM ad_view_wallet WHERE user_id = ?", [customeid]);
        const listWallet = walletResult[0];

        const curDate = moment().startOf('day').unix();
        const currentDate = moment().add(30, 'days').format('YYYY-MM-DD HH:mm:ss');
        const nowDate = moment().format('YYYY-MM-DD');


        const [adLimit2Result] = await pool.query("SELECT * FROM ad_view_income_list WHERE user_id = ? AND start_date = ?", [customeid, nowDate]);
        const adLimit2Count = adLimit2Result.length;

        const [memberPercResult] = await pool.query("SELECT * FROM membership WHERE member_id = ?", [customeid]);
        const listMember202405 = memberPercResult[0];

        const [adLimitResult] = await pool.query("SELECT * FROM ad_view_income_list WHERE user_id = ? AND start_date = ? AND video_id = ?", [customeid, nowDate, video_id]);
        const listAdViewLimit = adLimitResult[0];

        const userExpireDate = listWallet ? moment(listWallet.end_date).startOf('day').unix() : 0;

        if (userExpireDate !== curDate) {
            if (adLimit2Count <= 9) {
                if ((!listAdViewLimit || String(listAdViewLimit.video_id) !== video_id) && (!listWallet || listWallet.wallet < 30000) && listMember202405 && listMember202405.binary_status > 0) {

                    if (listWallet && String(listWallet.user_id) === String(customeid)) {
                        await pool.query("INSERT INTO ad_view_income_list (user_id, video_id, income, start_date) VALUES (?, ?, '100', NOW())", [customeid, video_id]);
                        const walletCount = Number(listWallet.wallet) + 100;
                        const videoWatchCount = listWallet.video_watch_count + 1;
                        await pool.query("UPDATE ad_view_wallet SET user_id = ?, wallet = ?, video_watch_count = ? WHERE user_id = ?", [customeid, walletCount, videoWatchCount, customeid]);
                    } else {
                        await pool.query("INSERT INTO ad_view_income_list (user_id, video_id, income, start_date) VALUES (?, ?, '100', NOW())", [customeid, video_id]);
                        await pool.query("INSERT INTO ad_view_wallet (user_id, wallet, video_watch_count, start_date, end_date) VALUES (?, '100', '1', NOW(), ?)", [customeid, currentDate]);
                    }
                    res.json({ message: 'Video view processed successfully' });
                } else {
                    res.json({ message: 'Conditions not met' });
                }
            } else {
                res.json({message: 'Daily video view limit reached'});
            }
        } else {
            res.json({ message: 'User expired date is current date' });
        }
    } catch (error) {
        console.error('Error processing video view:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//Rank Club Income

app.get('/rankclubincome/:customeid',verifyToken, async (req, res) => {
    const { customeid } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const offset = (page - 1) * limit;

        const results = await getRankClubIncome(pool, customeid, limit, offset);
        const totalCount = await getRankClubIncomeCount(pool, customeid);

        const totalPages = Math.ceil(totalCount / limit);


        const formattedResults = results.map((row, index) => ({
            id: offset + index + 1,
            userid: row.userid,
            fname: `${row.fname} ${row.lname}`,
            amount: row.amount,
            st: row.st
        }));

        res.send({
            totalPages,
            currentPage: page,
            totalItems: totalCount,
            items: formattedResults
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error occurred');
    }
});

app.get('/rankclubroyal/:customeid',verifyToken, async (req, res) => {
    const { customeid } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const offset = (page - 1) * limit;

        const results = await getRankClubRoyal(pool, customeid, limit, offset);
        const totalCount = await getRankClubRoyalCount(pool, customeid);

        const totalPages = Math.ceil(totalCount / limit);


        const formattedResults = results.map((row, index) => ({
            id: offset + index + 1,
            userid: row.userid,
            fname: `${row.fname} ${row.lname}`,
            amount: row.amount,
            st: row.st
        }));

        res.send({
            totalPages,
            currentPage: page,
            totalItems: totalCount,
            items: formattedResults
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error occurred');
    }
});

// Code Income

app.post('/add-code/:member_id',verifyToken, async (req, res) => {
    // Check for required parameters and session
    if (!req.body.code || !req.params.member_id) {
        return res.status(400).json({
            success: false,
            message: 'Missing required parameters'
        });
    }

    const { code } = req.body;
    const uid = req.params.member_id;
    console.log(uid)

    try {
        // Check if user is eligible (binary_status = 1 or 2)
        const [membershipRows] = await pool.query(
            "SELECT t1.* FROM `membership` t1 WHERE t1.member_id = ? AND (t1.binary_status = '1' OR t1.binary_status = '2')",
            [uid]
        );

        if (membershipRows.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'You are not eligible. ID not Active'
            });
        }

        // Check if user has data in any of the restricted tables
        const tablesToCheck = [
            "binary_income",
            "sponsor_income",
            "autopool_income",
            "boost1_income",
            "boost1_level_income",
            "goldboost_income",
            "diaboost_income"
        ];

        let dataFound = false;
        for (const table of tablesToCheck) {
            const [rows] = await pool.query(
                `SELECT * FROM ${table} WHERE uid = ?`,
                [uid]
            );

            if (rows.length > 0) {
                dataFound = true;
                break;
            }
        }

        if (dataFound) {
            return res.status(403).json({
                success: false,
                message: 'Not Eligible.'
            });
        }

        // Check code income capping
        const [walletRows] = await pool.query(
            "SELECT SUM(amount) AS main_wallet FROM `code_user_wallet` WHERE `uid` = ?",
            [uid]
        );

        const codeIncome = walletRows[0].main_wallet || 0;
        if (codeIncome > 1000) {
            return res.status(403).json({
                success: false,
                message: 'You have crossed the capping for Code Income.'
            });
        }

        // Check if code exists and is valid
        const [codeRows] = await pool.query(
            "SELECT * FROM `code` WHERE `code` = ?",
            [code]
        );

        if (codeRows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Code.'
            });
        }

        const codeData = codeRows[0];
        const fromTime = new Date(codeData.f_time).getTime();
        const toTime = new Date(codeData.t_time).getTime();
        const currentTime = Date.now();

        if (currentTime < fromTime) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Code.'
            });
        }

        if (currentTime > toTime) {
            return res.status(400).json({
                success: false,
                message: 'Code has been Expired.'
            });
        }

        // Check if user has already added this code
        const [userCodeRows] = await pool.query(
            "SELECT * FROM `code_users` WHERE `code` = ? AND `status` = 0 AND `uid` = ?",
            [code, uid]
        );

        if (userCodeRows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Code already added.'
            });
        }

        // Add the code
        await pool.query(
            "INSERT INTO code_users(uid, code, date, status) VALUES(?, ?, NOW(), '0')",
            [uid, code]
        );

        return res.json({
            success: true,
            message: 'Submitted Successfully.'
        });

    } catch (error) {
        console.error('Error in add-code:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

app.get('/code-income-list/:customeid', async (req, res) => {
    try {
        const { customeid } = req.params;

        // SQL query
        const query = `
      SELECT t1.*, t1.status as st, t1.date as sdat, t2.* 
      FROM code_users t1 
      JOIN membership t2 ON t2.member_id = t1.uid 
      WHERE t1.uid = ? 
      ORDER BY t1.id DESC
    `;

        // Execute query
        const [rows] = await pool.query(query, [customeid]);

        // Process results
        const result = rows.map((row, index) => ({
            serial: index + 1,
            userid: row.userid,
            name: `${row.fname} ${row.lname}`,
            code: row.code,
            date: row.sdat,
            status: getStatusText(row.st)
        }));

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error fetching code users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching code users'
        });
    }
});

// Helper function to convert status code to text
function getStatusText(statusCode) {
    switch(statusCode) {
        case '0': return 'Pending';
        case '2': return 'Rejected';
        default: return 'Approved';
    }
}

app.get('/code-user-wallet/:customeid', verifyToken, async (req, res) => {
    const { customeid } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const offset = (page - 1) * limit;

        const results = await getCodeUserWalletTransactions(pool, customeid, limit, offset);
        const totalCount = await getCodeUserWalletCount(pool, customeid);

        const totalPages = Math.ceil(totalCount / limit);

        const formattedResults = results.map((row, index) => ({
            id: offset + index + 1,
            userid: row.userid,
            name: `${row.fname} ${row.lname}`,
            amount: row.amount,
            date: row.de
        }));

        res.json({
            // success: true,
            totalPages,
            currentPage: page,
            totalItems: totalCount,
            items: formattedResults
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching code user wallet data'
        });
    }
});

// Wallet

app.post('/pool-two-wallet/:member_id', verifyToken, upload.single('image'), async (req, res) => {
    const member_id = req.params.member_id;

    if (member_id) {
        const amount = req.body.amount;
        const txn_id = req.body.txn_id;
        let imagePath = null;

        if (req.file) {
            imagePath = req.file.path; // Cloudinary returns a URL
        }

        try {
            const [result] = await pool.query(
                `INSERT INTO up_trans_history1 (uid, amount, txn_sc, txn_id, date, status, wal_type) VALUES (?, ?, ?, ?, NOW(), '0', '2')`,
                [member_id, amount, imagePath, txn_id]
            );

            res.json({ message: 'Success! Request Sent Successfully.', imageUrl: imagePath });
        } catch (err) {
            console.error("Database Error:", err);
            res.status(500).send('Database error');
        }
    } else {
        res.status(400).send('Invalid member_id');
    }
});

app.get('/pool-two-transactions/:customeid',verifyToken, async (req, res) => {
    const { customeid } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const offset = (page - 1) * limit;

        const results = await getPoolTwoTransactions(pool, customeid, limit, offset);
        const totalCount = await getPoolTwoTransactionsCount(pool, customeid);

        const totalPages = Math.ceil(totalCount / limit);


        const formattedResults = results.map((row, index) => ({
            id: offset + index + 1,
            userid: `${row.userid} (${row.fname} ${row.lname})`,
            txn_id: row.txn_id,
            txn_sc: row.txn_sc,
            amount: row.amount,
            sdat: row.sdat,
            status: row.st === '0' ? 'Pending' : row.st === '2' ? 'Rejected' : 'Approved',
        }));

        res.send({
            totalPages,
            currentPage: page,
            totalItems: totalCount,
            items: formattedResults
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error occurred');
    }
});


// Verify JWT Token
function verifyToken(req, res, next) {
  let token = req.headers['authorization'];
  if (token) {
    token = token.split(' ')[1];
    Jwt.verify(token, jwtKey, (err, valid) => {
      if (err) {
        res.status(401).send({ result: 'Please provide a valid token' });
      } else {
        next();
      }
    });
  } else {
    res.status(403).send({ result: 'Token is required for authentication.' });
  }
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on PORT: ${PORT}`);
});
