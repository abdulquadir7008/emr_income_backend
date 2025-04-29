const {getTransactions, getTransactionsCount} = require("./binaryFunction");
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