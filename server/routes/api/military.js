const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId'); // Middleware that validates object ID's in HTTP perameters
const httpErrorHandler = require('../../middleware/util/httpError'); // Middleware that parses errors and status for Express responses
const nexusError = require('../../middleware/util/throwError'); // Project Nexus middleware for error handling

// Mongoose Model Import
const { Military, Corps, Fleet } = require('../../models/military');

// @route   GET api/military
// @Desc    Get all Militaries
// @access  Public
router.get('/', async function (req, res) {
	logger.info('GET Route: api/militaries requested...');

	try {
		const military = await Military.find()
			.populate('team', 'name shortName')
			.populate('zone', 'name')
			.populate('country', 'name')
			.populate('site', 'name')
			.populate('origin')
			.sort({ team: 1 });
		res.status(200).json(military);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}

});

// @route   GET api/military/:id
// @Desc    Get Military by ID
// @access  Public
router.get('/:id', validateObjectId, async (req, res) => {
	logger.info('GET Route: api/military/:id requested...');
	const id = req.params.id;

	try {
		const military = await Military.findById(id)
			.populate('team', 'name shortName')
			.populate('zone', 'name')
			.populate('country', 'name')
			.populate('gear', 'name category')
			.populate('site', 'name')
			.populate('origin', 'name')
			.sort({ team: 1 });
		if (military != null) {
			res.status(200).json(military);
		}
		else {
			nexusError(`The Military with the ID ${id} was not found!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   POST api/military
// @Desc    Create New military unit
// @access  Public
router.post('/', async (req, res) => {
	logger.info('POST Route: api/military call made...');

	let newMilitary;
	switch(req.body.type) {

	case('Corps'):
		newMilitary = new Corps(req.body);
		break;

	case('Fleet'):
		newMilitary = new Fleet(req.body);
		break;

	default:
		logger.info(`Team ${req.body.name} has invalid type ${req.body.type}`);
		res.status(500).json(newMilitary);

	}

	try {
		await newMilitary.validateMilitary();
		newMilitary = await newMilitary.save();
		logger.info(`Unit ${newMilitary.name} created...`);
		res.status(200).json(newMilitary);
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   DELETE api/military/:id
// @Desc    Delete an military unit
// @access  Public
router.delete('/:id', async function (req, res) {
	logger.info('DEL Route: api/military/:id call made...');
	const id = req.params.id;

	try {
		const military = await Military.findByIdAndRemove(id);

		if (military != null) {
			logger.info(`The unit ${military.name} with the id ${id} was deleted!`);
			res.status(200).send(military);
		}
		else {
			nexusError(`No military with the id ${id} exists!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   PATCH api/military/deleteAll
// @desc    Delete All Military
// @access  Public
router.patch('/deleteAll', async function (req, res) {
	const data = await Military.deleteMany();
	console.log(data);
	return res.status(200).send(`We wiped out ${data.deletedCount} Military!`);
});

module.exports = router;
