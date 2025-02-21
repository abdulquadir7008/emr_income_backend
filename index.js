const express = require('express');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();
const cors = require('cors');
// import { Blob } from '@vercel/blob';
const Jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const multer = require('multer');
const session = require('express-session');
const path = require('path');


const { GetUids, getLevelid, GetBinaryIncome, GetUserByPos, GetBinaryIncomeCount, GetRoboticIncome, GetRoboticIncomeCount  } = require('./include/binaryFunction');

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
