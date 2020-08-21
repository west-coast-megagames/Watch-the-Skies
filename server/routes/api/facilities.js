const routeDebugger = require('debug')('app:routes:facilities');
const express = require('express');
const nexusEvent = require('../../startup/events');
const router = express.Router();
const validateObjectId = require('../../middleware/validateObjectId');

const { logger } = require('../../middleware/winston');

// Facility Model - Using Mongoose Model
const { Facility } = require('../../models/gov/facility/facility');


// @route   GET api/facilities
// @Desc    Get all facilities
// @access  Public
router.get('/', async function (req, res) {
    routeDebugger('Looking up all facilities...');
    let facilities = await Facility.find()
      .populate('site', 'name type')
      .populate('team', 'shortName name sciRate')
      .populate('research')
      .populate('equipment');

    res.status(200).json(facilities);
});

// @route   GET api/facility
// @Desc    Get Facilities by ID
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
  let id = req.params.id;
  let facility = await Facility.findById(id)
    .sort({team: 1})
    .populate('team', 'name shortName')
    .populate('site', 'name')
    .populate('research')
    .populate('equipment');

  if (facility != null) {
    res.json(facility);
  } else {
    res.status(404).send(`The facility with the ID ${id} was not found!`);
  } 
});

// @route   GET api/facilities/research
// @Desc    Get all facilities
// @access  Public
router.put('/research', async function (req, res) {
  routeDebugger('Updating facility...');
  let update = req.body;
  console.log(update);
  try {

    let facility = await Facility.findById(update._id);
  
    if (!facility){
      res.status(404).send(`The facility with the ID ${update._id} was not found!`);
    } else {
      if (facility.capability.research.active){
        routeDebugger(`${facility.name} lab 0${update.index + 1} is being updated...`)
        facility.capability.research.funding.set(update.index, parseInt(update.funding));
        facility.capability.research.projects.set(update.index, update.research);
      }
    
      facility = await facility.save();
      console.log(facility);
      res.status(200).send(`Research goals for ${facility.name} lab 0${update.index} have been updated!`);
      nexusEvent.emit("updateFacilities");
    }
  } catch (err) {
    res.status(400).send(err.message)
  }

});

module.exports = router;