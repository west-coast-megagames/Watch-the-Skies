// Team Model - Using Mongoose Model

const {
  Team,
  validateTeam,
  National,
  validateNational,
  Alien,
  validateAlien,
  Control,
  validateControl,
  Npc,
  validateNpc,
  Media,
  validateMedia,
  validateRoles,
} = require("../models/team");
const { Country } = require("../models/country");
const { Account } = require("../models/account");
const { Log } = require("../models/logs/log");
const { Treaty } = require("../models/treaty");
const { Trade } = require("../models/trade");

const teamCheckDebugger = require("debug")("app:teamCheck");
const { logger } = require("../middleware/log/winston"); // Import of winston for error logging
require("winston-mongodb");

const supportsColor = require("supports-color");

// National, Alien, Media, Control, ncP
const teamTypeVals = ["N", "A", "M", "C", "P"];

function inArray(array, value) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == value) return true;
  }
  return false;
}

async function chkTeam(runFlag) {
  // get accounts once
  let aFinds = await Account.find();

  for (const team of await Team.find()
    //.populate("homeCountry", "name")   does not work with .lean
    .lean()) {
    //do not need toObject with .lean()
    //let testPropertys = zone.toObject();

    if (!team.hasOwnProperty("model")) {
      logger.error(`model missing for team ${team.name} ${team._id}`);
    }

    if (!team.hasOwnProperty("gameState")) {
      logger.error(`gameState missing for team ${team.name} ${team._id}`);
    }

    if (!team.hasOwnProperty("serviceRecord")) {
      logger.error(`serviceRecord missing for Team ${team.name} ${team._id}`);
    } else {
      for (let i = 0; i < team.serviceRecord.length; ++i) {
        let lFind = await Log.findById(team.serviceRecord[i]);
        if (!lFind) {
          logger.error(
            `Team ${team.name} ${team._id} has an invalid serviceRecord reference ${i}: ${team.serviceRecord[i]}`
          );
        }
      }
    }

    if (!team.hasOwnProperty("treaties")) {
      logger.error(`treaties missing for Team ${team.name} ${team._id}`);
    } else {
      for (let i = 0; i < team.treaties.length; ++i) {
        let tFind = await Treaty.findById(team.treaties[i]);
        if (!tFind) {
          logger.error(
            `Team ${team.name} ${team._id} has an invalid treaties reference ${i}: ${team.treaties[i]}`
          );
        }
      }
    }

    if (!team.hasOwnProperty("trades")) {
      logger.error(`trades missing for Team ${team.name} ${team._id}`);
    } else {
      for (let i = 0; i < team.trades.length; ++i) {
        let trFind = await Trade.findById(team.trades[i]);
        if (!trFind) {
          logger.error(
            `Team ${team.name} ${team._id} has an invalid trades reference ${i}: ${team.trades[i]}`
          );
        }
      }
    }

    if (!team.hasOwnProperty("name")) {
      logger.error(`name missing for team ${team._id}`);
    } else {
      if (team.name === "" || team.name == undefined || team.name == null) {
        logger.error(`name is blank for Team ${team.name} ${team._id}`);
      }
    }

    if (!team.hasOwnProperty("shortName")) {
      logger.error(`shortName missing for team ${team.name} ${team._id}`);
    } else {
      if (
        team.shortName === "" ||
        team.shortName == undefined ||
        team.shortName == null
      ) {
        logger.error(`shortName is blank for Team ${team.name} ${team._id}`);
      }
    }

    if (!team.hasOwnProperty("teamCode")) {
      logger.error(`teamCode missing for team ${team.name} ${team._id}`);
    } else {
      if (
        team.teamCode === "" ||
        team.teamCode == undefined ||
        team.teamCode == null
      ) {
        logger.error(`teamCode is blank for Team ${team.name} ${team._id}`);
      }
    }

    if (!team.hasOwnProperty("teamType")) {
      logger.error(`teamType missing for team ${team.name} ${team._id}`);
    } else {
      if (!inArray(teamTypeVals, team.teamType)) {
        logger.error(
          `Invalid type ${team.teamType} for Team ${team.name} ${team._id}`
        );
      }
    }

    //should be 6 accounts for each team
    let accountCount = 0;
    let teamId = team._id.toHexString();
    accountLoop: for (let j = 0; j < aFinds.length; ++j) {
      let aTeamId = aFinds[j].team.toHexString();
      if (aTeamId === teamId) {
        ++accountCount;
      }
    }

    //teamCheckDebugger("jeff 1 ... accountCount", accountCount, team.teamCode);
    if (accountCount != 6) {
      logger.error(`Not 6 Accounts for team ${team.teamCode} ${team.name}`);
    }

    if (!team.hasOwnProperty("type")) {
      logger.error(`type missing for team ${team.name} ${team._id}`);
    } else {
      if (team.type === "National") {
        //should have homeCountry link
        if (!team.hasOwnProperty("homeCountry")) {
          logger.error(
            `homeCountry link missing for National Team ${team.name} ${team._id}`
          );
        } else {
          let cFind = await Country.findById(team.homeCountry);
          if (!cFind) {
            logger.error(
              `National Team ${team.name} ${team._id} has an invalid homeCountry reference: ${team.homeCountry}`
            );
          }
        }

        if (!team.hasOwnProperty("prTrack")) {
          logger.error(
            `prTrack missing for National Team ${team.name} ${team._id}`
          );
        } else {
          if (team.prTrack.length < 9) {
            logger.error(
              `National Team ${team.name} ${team._id} prTrack is fewer than 9 ${team.prTrack}`
            );
          }

          if (team.prTrack[0] != 0) {
            logger.error(
              `National Team ${team.name} ${team._id} prTrack first element is not zero ${team.prTrack[0]}`
            );
          }
        }

        if (!team.hasOwnProperty("roles")) {
          logger.error(
            `roles missing for National Team ${team.name} ${team._id}`
          );
        } else {
          if (team.roles.length < 1) {
            logger.error(
              `No roles assigned for National Team ${team.name} ${team._id}`
            );
          } else {
            try {
              for (let currRole of team.roles) {
                let test2 = validateRoles(currRole);
                if (test2.error) {
                  logger.error(
                    `National Team Val Roles Error: For ${team.name} Error: ${test2.error.details[0].message}`
                  );
                }
              }
            } catch (err) {
              logger.error(
                `National Team Roles Validation Error For ${team.name} ${team.teamCode} Error: ${err.message}`
              );
            }
          }
        }

        if (!team.hasOwnProperty("sciRate")) {
          logger.error(
            `sciRate missing for National Team ${team.name} ${team._id}`
          );
        } else {
          if (isNaN(team.sciRate)) {
            logger.error(
              `National Team ${team.name} ${team._id} sciRate is not a number ${team.sciRate}`
            );
          }
        }

        if (!team.hasOwnProperty("agents")) {
          logger.error(
            `agents missing for National Team ${team.name} ${team._id}`
          );
        } else {
          if (isNaN(team.agents)) {
            logger.error(
              `National Team ${team.name} ${team._id} agents is not a number ${team.agents}`
            );
          }
        }

        if (!team.hasOwnProperty("prLevel")) {
          logger.error(
            `prLevel missing for National Team ${team.name} ${team._id}`
          );
        } else {
          if (isNaN(team.prLevel)) {
            logger.error(
              `National Team ${team.name} ${team._id} prLevel is not a number ${team.prLevel}`
            );
          }
        }

        try {
          let { error } = validateNational(team);
          if (error) {
            logger.error(
              `National Team Validation Error For ${team.name} Error: ${error.message}`
            );
          }
        } catch (err) {
          logger.error(
            `National Team Validation Error For ${team.name} ${team.teamCode} Error: ${err.message}`
          );
        }
      }

      if (team.type === "Alien") {
        if (!team.hasOwnProperty("roles")) {
          logger.error(`roles missing for Alien Team ${team.name} ${team._id}`);
        } else {
          if (team.roles.length < 1) {
            logger.error(
              `No roles assigned for Alien Team ${team.name} ${team._id}`
            );
          } else {
            try {
              for (let currRole of team.roles) {
                let test2 = validateRoles(currRole);
                if (test2.error) {
                  logger.error(
                    `Alien Team Val Roles Error: For ${team.name} Error: ${test2.error.details[0].message}`
                  );
                }
              }
            } catch (err) {
              logger.error(
                `Alien Team Roles Validation Error For ${team.name} ${team.teamCode} Error: ${err.message}`
              );
            }
          }
        }

        if (!team.hasOwnProperty("sciRate")) {
          logger.error(
            `sciRate missing for Alien Team ${team.name} ${team._id}`
          );
        } else {
          if (isNaN(team.sciRate)) {
            logger.error(
              `Alien Team ${team.name} ${team._id} sciRate is not a number ${team.sciRate}`
            );
          }
        }

        if (!team.hasOwnProperty("agents")) {
          logger.error(
            `agents missing for Alien Team ${team.name} ${team._id}`
          );
        } else {
          if (isNaN(team.agents)) {
            logger.error(
              `Alien Team ${team.name} ${team._id} agents is not a number ${team.agents}`
            );
          }
        }

        if (!team.hasOwnProperty("actionPts")) {
          logger.error(
            `actionPts missing for Alien Team ${team.name} ${team._id}`
          );
        } else {
          if (isNaN(team.actionPts)) {
            logger.error(
              `Alien Team ${team.name} ${team._id} actionPts is not a number ${team.agents}`
            );
          }
        }

        try {
          let { error } = validateAlien(team);
          if (error) {
            logger.error(
              `Alien Team Validation Error For ${team.name} Error: ${error.message}`
            );
          }
        } catch (err) {
          logger.error(
            `Alien Team Validation Error For ${team.name} ${team.teamCode} Error: ${err.message}`
          );
        }
      }

      if (team.type === "Control") {
        if (!team.hasOwnProperty("roles")) {
          logger.error(
            `roles missing for Control Team ${team.name} ${team._id}`
          );
        } else {
          if (team.roles.length < 1) {
            logger.error(
              `No roles assigned for Control Team ${team.name} ${team._id}`
            );
          } else {
            try {
              for (let currRole of team.roles) {
                let test2 = validateRoles(currRole);
                if (test2.error) {
                  logger.error(
                    `Control Team Val Roles Error: For ${team.name} Error: ${test2.error.details[0].message}`
                  );
                }
              }
            } catch (err) {
              logger.error(
                `Control Team Roles Validation Error For ${team.name} ${team.teamCode} Error: ${err.message}`
              );
            }
          }
        }

        if (!team.hasOwnProperty("sciRate")) {
          logger.error(
            `sciRate missing for Control Team ${team.name} ${team._id}`
          );
        } else {
          if (isNaN(team.sciRate)) {
            logger.error(
              `Control Team ${team.name} ${team._id} sciRate is not a number ${team.sciRate}`
            );
          }
        }

        try {
          let { error } = validateControl(team);
          if (error) {
            logger.error(
              `Control Team Validation Error For ${team.name} Error: ${error.message}`
            );
          }
        } catch (err) {
          logger.error(
            `Control Team Validation Error For ${team.name} ${team.teamCode} Error: ${err.message}`
          );
        }
      }

      if (team.type === "Media") {
        if (!team.hasOwnProperty("agents")) {
          logger.error(
            `agents missing for Media Team ${team.name} ${team._id}`
          );
        } else {
          if (isNaN(team.agents)) {
            logger.error(
              `Media Team ${team.name} ${team._id} agents is not a number ${team.agents}`
            );
          }
        }

        try {
          let { error } = validateMedia(team);
          if (error) {
            logger.error(
              `Media Team Validation Error For ${team.name} Error: ${error.message}`
            );
          }
        } catch (err) {
          logger.error(
            `Media Team Validation Error For ${team.name} ${team.teamCode} Error: ${err.message}`
          );
        }
      }

      if (team.type === "Npc") {
        try {
          let { error } = validateNpc(team);
          if (error) {
            logger.error(
              `NPC Team Validation Error For ${team.name} Error: ${error.message}`
            );
          }
        } catch (err) {
          logger.error(
            `NPC Team Validation Error For ${team.name} ${team.teamCode} Error: ${err.message}`
          );
        }
      }
    }

    try {
      let { error } = validateTeam(team);
      if (error) {
        logger.error(
          `Team Validation Error For ${team.name} Error: ${error.message}`
        );
      }
    } catch (err) {
      logger.error(
        `Team Validation Error For ${team.name} ${team.teamCode} Error: ${err.message}`
      );
    }
  }
  return true;
}

module.exports = chkTeam;
