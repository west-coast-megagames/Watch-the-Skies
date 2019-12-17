const routeDebugger = require('debug')('app:routes');
const express = require('express');
const router = express.Router();

const { logger } = require('../../middleware/winston');

// Interceptor Model - Using Mongoose Model
const { Account } = require('../../models/gov/account');

// @route   GET api/account
// @Desc    Get all Accounts
// @access  Public
router.get('/', async function (req, res) {
    routeDebugger('Looking up accounts...');
    let accounts = await Account.find().sort({code: 1});
    res.json(accounts);
});

// @route   GET api/account/:id
// @Desc    Get all single account
// @access  Public
router.get('/:id', async function (req, res) {
    routeDebugger('Looking up a account...');
    let account = await Account.findById({ _id: req.params.id });
    res.json(account);
});

// @route   POST api/account
// @Desc    Post a new account
// @access  Public
router.post('/', async function (req, res) {
    let { name, code, balance, deposits, withdrawls, autoTransfers } = req.body;
    const { error } = validateAccount(req.body);
        if (error) return res.status(400).send(error.details[0].message);

    const newAccount = new Account(
        { name, code, balance, deposits, withdrawls, autoTransfers }
    );
    let docs = await Account.find({ name });
    if (!docs.length) {
        let account = await newAccount.save();
        res.json(account);
        routeDebugger(`The ${name} account created...`);
    } else {                
        console.log(`${name} account already exists!`);
        res.status(400).send(`${name} account already exists!`);
    }
});

// @route   DELETE api/account/:id
// @Desc    Delete a account
// @access  Public
router.delete('/:id', async function (req, res) {
    let id = req.params.id;
    const account = await account.findByIdAndRemove(id);
    if (account != null) {
        logger.info(`${account.name} with the id ${id} was deleted!`);
        res.send(`${account.name} with the id ${id} was deleted!`);
    } else {
        res.send(`No account with the id ${id} exists!`);
    }
});

module.exports = router;