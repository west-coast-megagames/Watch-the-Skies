// Equipment Model - Using Mongoose Model
const { Equipment, validateEquipment } = require('../../models/gov/equipment/equipment');
const { Gear } = require('../../models/gov/equipment/gear');
const { Infrustructure } = require('../../models/gov/equipment/infrustructure');
const { System } = require('../../models/gov/equipment/systems');


const equipmentCheckDebugger = require('debug')('app:equipmentCheck');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

async function chkEquipment(runFlag) {
  
  for (const equipment of await Equipment.find()
                               .populate("team", "name teamType")
                               .populate("manufacturer", "name teamType")) { 
    
    if (!equipment.populated("team")) {  
      logger.error(`Team link missing for Equipment ${equipment.name} ${equipment._id}`);
    }

    if (!equipment.populated("manufacturer")) {  
      logger.error(`Manufacturer link missing for Equipment ${equipment.name} ${equipment._id}`);
    }

    let { error } = validateEquipment(equipment);
    if ( error)  {
      logger.error(`Equipment Validation Error For ${equipment.name} Error: ${error.details[0].message}`);
    }

  }
  return true;
};

module.exports = chkEquipment;