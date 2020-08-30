const fs = require("fs");
const config = require("config");
const file = fs.readFileSync(
  config.get("initPath") + "init-json/initAircraft.json",
  "utf8"
);
const aircraftDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const aircrafLoadDebugger = require("debug")("app:aircraftLoad");
const { logger } = require("../middleware/winston"); // Import of winston for error logging
require("winston-mongodb");

const supportsColor = require("supports-color");

const express = require("express");
const bodyParser = require("body-parser");

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Aircraft Model - Using Mongoose Model
const {
  Aircraft,
  validateAircraft,
  updateStats,
} = require("../models/ops/aircraft");
const { Zone } = require("../models/zone");
const { Country } = require("../models/country");
const { Team } = require("../models/team/team");
const { System } = require("../models/gov/upgrade/upgrade");
const { loadSystems, systems } = require("../wts/construction/systems/systems");
const { validUnitType } = require("../wts/util/construction/validateUnitType");
const { Site } = require("../models/sites/site");
const { delSystems } = require("../wts/util/construction/deleteSystems");
const { Facility } = require("../models/gov/facility/facility");
const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function runaircraftLoad(runFlag) {
  try {
    //logger.debug("Jeff in runaircraftLoad", runFlag);
    if (!runFlag) return false;
    if (runFlag) {
      await loadSystems(); // load wts/json/upgrade/systems.json data into array

      await deleteAllAircrafts(runFlag);
      await initLoad(runFlag);
    }
    return true;
  } catch (err) {
    logger.error(`Catch runaircraftLoad Error: ${err.message}`, { meta: err });
    return false;
  }
}

async function initLoad(doLoad) {
  if (!doLoad) return;

  let recReadCount = 0;
  let recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

  for (let data of aircraftDataIn) {
    ++recReadCount;
    await loadAircraft(data, recCounts);
  }

  logger.info(
    `Aircraft Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
  );
}

async function loadAircraft(iData, rCounts) {
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";

  try {
    //logger.debug(`Jeff in loadAircraft  ${iData.name} ${iData.type}`);
    let aircraft = await Aircraft.findOne({ name: iData.name });

    loadName = iData.name;

    if (!aircraft) {
      // New Aircraft here
      let aircraft = new Aircraft({
        name: iData.name,
        type: iData.type,
        mission: iData.mission,
      });

      aircraft.stats = iData.stats;
      aircraft.status = iData.status;
      aircraft.serviceRecord = [];
      aircraft.gameState = [];

      if (iData.team != "") {
        let team = await Team.findOne({ teamCode: iData.team });
        if (!team) {
          //logger.debug(`Aircraft Load Team Error, New Aircraft: ${iData.name}  Team:  ${iData.team}`);
          loadError = true;
          loadErrorMsg = `Team Not Found: ${iData.teamCode}`;
        } else {
          aircraft.team = team._id;
          //logger.debug(`Aircraft Load Team Found, Aircraft: ${iData.name} Team:  ${iData.team} Team ID: ${team._id}`);
        }
      }

      if (!loadError) {
        // create systems records for aircraft and store ID in aircraft.system
        //console.log("jeff aircraft systems  iData.loadout", iData.loadout);
        aircraft.systems = [];
        for (let sys of iData.loadout) {
          let systemsError = true;

          let sysRef =
            systems[systems.findIndex((system) => system.code === sys)];
          //console.log("jeff in aircraft systems ", sys, "sysRef:", sysRef);
          if (sysRef) {
            if (validUnitType(sysRef.unitType, aircraft.type)) {
              systemsError = false;
              newSystem = await new System(sysRef);
              newSystem.team = aircraft.team;
              newSystem.manufacturer = aircraft.team;
              newSystem.status.building = false;
              newSystem.unitType = aircraft.type;

              try {
                await newSystem.save();
                //logger.debug(`aircraft.name, system ${sys} add saved to system collection.`);
              } catch (err) {
                logger.error(`New Aircraft System Save Error: ${err.message}`, {
                  meta: err,
                });
                systemsError = true;
                //return console.error(`New Aircraft System Save Error: ${err}`);
              }

              if (!systemsError) {
                aircraft.systems.push(newSystem._id);
              }
            } else {
              logger.debug(
                `Error in creation of system ${sys} for  ${aircraft.name} - wrong unitType`
              );
            }
          } else {
            logger.debug(
              `Error in creation of system ${sys} for  ${aircraft.name}`
            );
          }
        }
      }

      baseSite = undefined;
      if (iData.base != "" && iData.base != "undefined") {
        // 2020-08-16 base moved to facility
        let facility = await Facility.findOne({ code: iData.base });
        if (!facility) {
          //logger.debug(`Aircraft Load Base Error, New Aircraft:  ${iData.name}  Base:  ${iData.base}`);
          loadError = true;
          loadErrorMsg = "Base Not Found: " + iData.base;
        } else {
          if (facility.capability.airMission.capacity > 0) {
            aircraft.origin = facility._id;
            baseSite = facility.site;
            //logger.debug(`Aircraft Load Base Site Found, Aircraft: ${iData.name}  Base:  ${iData.base} Base ID: ${facility._id}`);
          } else {
            loadError = true;
            loadErrorMsg =
              "Base " +
              iData.base +
              " does not have positive airMission capacity.";
          }
        }
      }

      if (iData.site != "" && iData.site != "undefined") {
        let site = await Site.findOne({ siteCode: iData.site });
        if (!site) {
          //logger.debug(`Aircraft Load Site Error, New Aircraft:  ${iData.name}  Site:  ${iData.site}`);
          loadError = true;
          loadErrorMsg = "Site Not Found: " + iData.site;
        } else {
          aircraft.site = site._id;
          //logger.debug(`Aircraft Load Site Found, Aircraft: ${iData.name}  Site:  ${iData.site} Site ID: ${site._id}`);
        }
      } else {
        aircraft.site = baseSite;
      }

      if (iData.zone != "") {
        let zone = await Zone.findOne({ code: iData.zone });
        if (!zone) {
          //logger.debug(`Aircraft Load Zone Error, New Aircraft: ${iData.name}  Zone:  ${iData.zone}`);
          loadError = true;
          loadErrorMsg = "Zone Not Found: " + iData.zone;
        } else {
          aircraft.zone = zone._id;
          //logger.debug(`Aircraft Load Zone Found, New Aircraft: ${iData.name}  Zone:  ${iData.zone} Zone ID: ${zone._id}`);
        }
      }

      if (iData.country != "") {
        let country = await Country.findOne({ code: iData.country });
        if (!country) {
          //logger.debug(`Aircraft Load Country Error, New Aircraft: ${iData.name} Country:  ${iData.country}`);
          loadError = true;
          loadErrorMsg = "Country Not Found: " + iData.country;
        } else {
          aircraft.country = country._id;
          aircraft.zone = country.zone;
          logger.debug(
            `Aircraft Load Country Found, New Aircraft: ${iData.name}  Country:  ${iData.country} Country ID: ${country._id}`
          );
        }
      }

      let { error } = validateAircraft(aircraft);
      if (error) {
        loadError = true;
        loadErrorMsg = "Validation Error: " + error.message;
        //return;
      }

      if (loadError) {
        logger.error(
          `Aircraft skipped due to errors: ${loadName} ${loadErrorMsg}`
        );
        delSystems(aircraft.systems);
        ++rCounts.loadErrCount;
        return;
      } else {
        try {
          let aircraftSave = await aircraft.save();
          ++rCounts.loadCount;
          logger.debug(
            `${aircraftSave.name} add saved to aircraft collection.`
          );
          updateStats(aircraftSave._id);
          return;
        } catch (err) {
          delSystems(aircraft.systems);
          ++rCounts.loadErrCount;
          logger.error(`New Aircraft Save Error: ${err.message}`, {
            meta: err,
          });
          return;
        }
      }
    } else {
      // Existing Aircraft here ... update
      let id = aircraft._id;

      aircraft.name = iData.name;
      aircraft.type = iData.type;
      aircraft.status = iData.status;
      aircraft.stats = iData.stats;
      aircraft.mission = iData.mission;

      if (iData.team != "") {
        let team = await Team.findOne({ teamCode: iData.team });
        if (!team) {
          //logger.debug("Aircraft Load Team Error, Update Aircraft:", iData.name, " Team: ", iData.team);
          loadError = true;
          loadErrorMsg = "Team Not Found: " + iData.teamCode;
        } else {
          aircraft.team = team._id;
          //logger.debug("Aircraft Load Update Team Found, Aircraft:", iData.name, " Team: ", iData.team, "Team ID:", team._id);
        }
      }

      if (!loadError) {
        // create systems records for aircraft and store ID in aircraft.system
        if (iData.loadout.length != 0) {
          // create systems records for aircraft and store ID in aircraft.system
          aircraft.systems = [];
          for (let sys of iData.loadout) {
            systemsError = true;
            let sysRef =
              systems[systems.findIndex((system) => system.code === sys)];
            if (validUnitType(sysRef.unitType, aircraft.type)) {
              newSystem = await new System(sysRef);
              newSystem.team = aircraft.team;
              newSystem.manufacturer = aircraft.team;
              newSystem.status.building = false;
              newSystem.unitType = aircraft.type;
              let systemsError = false;
              try {
                await newSystem.save();
                //logger.debug(aircraft.name, "system", sys, " add saved to system collection.");
              } catch (err) {
                logger.error(`New Aircraft System Save Error: ${err.message}`, {
                  meta: err,
                });
                systemsError = true;
              }

              if (!systemsError) {
                aircraft.systems.push(newSystem._id);
              }
            }
          }
        }
      }

      baseSite = undefined;
      if (iData.base != "" && iData.base != "undefined") {
        //changed to site to handle both Base and Spacecraft (for Alien)
        let facility = await Facility.findOne({ code: iData.base });
        if (!facility) {
          //logger.debug("Aircraft Load Base Site Error, Update Aircraft:", iData.name, " Base: ", iData.base);
          loadError = true;
          loadErrorMsg = "Base Not Found: " + iData.base;
        } else {
          if (facility.capability.airMission.capacity > 0) {
            aircraft.origin = facility._id;
            baseSite = facility.site;
            //logger.debug(`Aircraft Load Update Base Site Found, Aircraft: ${iData.name}  Base:  ${iData.base} Base ID: ${facility._id}`);
          } else {
            loadError = true;
            loadErrorMsg =
              "Base " +
              iData.base +
              " does not have positive airMission capacity.";
          }
        }
      }

      if (iData.site != "" && iData.site != "undefined") {
        let site = await Site.findOne({ siteCode: iData.site });
        if (!site) {
          //logger.debug("Aircraft Load Site Error, Update Aircraft:", iData.name, " Site: ", iData.site);
          loadError = true;
          loadErrorMsg = "Site Not Found: " + iData.site;
        } else {
          aircraft.site = site._id;
          //logger.debug("Aircraft Load Update Site Found, Aircraft:", iData.name, " Site: ", iData.base, "Site ID:", site._id);
        }
      } else {
        aircraft.site = baseSite;
      }

      if (iData.zone != "") {
        let zone = await Zone.findOne({ code: iData.zone });
        if (!zone) {
          //logger.debug("Aircraft Load Zone Error, Update Aircraft:", iData.name, " Zone: ", iData.zone);
          loadError = true;
          loadErrorMsg = "Zone Not Found: " + iData.zone;
        } else {
          aircraft.zone = zone._id;
          //logger.debug("Aircraft Load Zone Found, Update Aircraft:", iData.name, " Zone: ", iData.zone, "Zone ID:", zone._id);
        }
      }

      if (iData.country != "") {
        let country = await Country.findOne({ code: iData.country });
        if (!country) {
          //logger.debug("Aircraft Load Country Error, Update Aircraft:", iData.name, " Country: ", iData.country);
          loadError = true;
          loadErrorMsg = "Country Not Found: " + iData.country;
        } else {
          aircraft.country = country._id;
          aircraft.zone = country.zone;
          //logger.debug("Aircraft Load Country Found, Update Aircraft:", iData.name, " Country: ", iData.country, "Country ID:", country._id);
        }
      }

      const { error } = validateAircraft(aircraft);
      if (error) {
        //logger.debug("Aircraft Update Validate Error", iData.name, error.message);
        //return
        loadError = true;
        loadErrorMsg = "Aircraft Validation Error: " + error.message;
      }

      if (loadError) {
        logger.error(
          `Aircraft skipped due to errors: ${loadName} ${loadErrorMsg}`
        );
        delSystems(aircraft.systems);
        ++rCounts.loadErrCount;
        return;
      } else {
        try {
          let aircraftSave = await aircraft.save();
          ++rCounts.updCount;
          logger.info(
            `${aircraftSave.name} update saved to aircraft collection.`
          );
          updateStats(aircraftSave._id);
          return;
        } catch (err) {
          delSystems(aircraft.systems);
          ++rCounts.loadErrCount;
          logger.error(`Aircraft Update Save Error: ${err.message}`, {
            meta: err,
          });
          return;
        }
      }
    }
  } catch (err) {
    ++rCounts.loadErrCount;
    logger.error(`Catch Aircraft Error: ${err.message}`, { meta: err });
    delSystems(aircraft.systems);
    return;
  }
}

async function deleteAllAircrafts(doLoad) {
  //logger.debug("Jeff in deleteAllAircrafts", doLoad);
  if (!doLoad) return;

  try {
    for await (const aircraft of Aircraft.find()) {
      let id = aircraft._id;

      //logger.debug("Jeff in deleteAllAircrafts loop", aircraft.name);
      try {
        // remove associated systems records
        delSystems(aircraft.systems);

        let aircraftDel = await Aircraft.findByIdAndRemove(id);
        if ((aircraftDel = null)) {
          logger.error(`The Aircraft with the ID ${id} was not found!`);
        }
        //logger.debug("Jeff in deleteAllAircrafts loop after remove", aircraft.name);
      } catch (err) {
        logger.error(`Aircraft Delete All Error: ${err.message}`, {
          meta: err,
        });
      }
    }
    logger.info("All Aircrafts succesfully deleted!");
  } catch (err) {
    logger.error(`Delete All Aircrafts Catch Error: ${err.message}`, {
      meta: err,
    });
  }
}

module.exports = runaircraftLoad;
