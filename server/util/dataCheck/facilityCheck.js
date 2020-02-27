// Facility Model - Using Mongoose Model
const { Facility, validateFacility } = require('../../models/gov/facility/facility');

const facilityLoadDebugger = require('debug')('app:facilityLoad');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

async function chkFacility() {
  for (const facility of await Facility.find()
                                     .populate("team", "name")
                                     .populate("site", "siteName")) { 
    if (!facility.populated("team")) {  
      logger.error(`Team link missing for Facility ${facility.name} ${facility._id}`);
    }
    if (!facility.populated("site")) {  
        logger.error(`Site link missing for Facility ${facility.name} ${facility._id}`);
    }    

    let { error } = await validateFacility(facility); 
    if (error) {
      logger.error(`Facility Validation Error For ${facility.name} Error: ${error.details[0].message}`);
    }
    
  }
};

module.exports = chkFacility;