const { DataTypes } = require('sequelize');
const sequelize = require('../include/dbconnect');
const Membership = sequelize.define('membership', {
    member_id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    userid: DataTypes.STRING,
    fname: DataTypes.STRING,
    lname: DataTypes.STRING,
    binary_status: DataTypes.INTEGER,
    date: DataTypes.DATE,
});

const Pairing = sequelize.define('pairing', {
    uid: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    parent_id: DataTypes.STRING,
    position: DataTypes.STRING,
});

module.exports = { sequelize, Membership, Pairing };
