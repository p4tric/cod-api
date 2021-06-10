'use strict';

const express       = require('express'),
router              = express.Router(),
mongoose            = require('mongoose'),
passport            = require('passport'),
jwt                 = require('jsonwebtoken'), //express-jwt'),
bcrypt              = require('bcrypt'),
uuidv1              = require('uuid/v1'),
uuidv4              = require('uuid/v4'),
config              = require('../config/config');

require('../config/pp')(passport);

// const API = require('call-of-duty-api')();
const API = require('call-of-duty-api')({ platform: "all" });

const { sendError, sendSuccess } = require ('../utils/methods');

router.post('/authenticate', async function(req, res, next) {
  let token = config.getToken(req.headers);

  console.log('[PARAMS BODY] ', req.params, req.body);

  if (token) {
    if (req.body.email && req.body.password) {
      const { email, password } = req.body;
      let res1;
      try {
        res1 = await API.login(email, password);
        console.log('[RES1] ', res1);
      } catch(err0) {
         console.log('[ERROR] ', err0);
         return sendError(res, err0);
      }
      return sendSuccess(res, res1);
    } else {
      return sendError(res, "Server failed.");
    }
  }
});

router.get('/player-stats', async function(req, res, next) {
  let token = config.getToken(req.headers);


  console.log('[QUERY PARAMS BODY] ', req.query, req.params, req.body);


  //if (token) {
    /*
      psn      // PlayStation
      steam    // Steam
      battle   // BattleNET
      xbl      // XBOX
      acti     // Activision ID
      uno      // numerical representation of Activision ID
      all      // All platforms, used for fuzzySearch

      steam - "Steam Doesn't exist for MW. Try `battle` instead.",
      battle - "Not permitted: not allowed"
      xbl, acti, uno, all - "Incorrect username or platform? Misconfigured privacy settings?"
    */
    let data;
    let sanitizedData;
    if (req.query.gametag && req.query.platform) {
      const { gametag, platform } = req.query;
      try {

        const res1 = await API.login(
          'jadokodeih@gmail.com',
          'jadoma99'
        );
        console.log('[RES1] ', res1);


        // ALLOWED: psn, xbl, battle, steam
        data = await API.MWcombatwz(gametag, platform);

        const utcStartSeconds = data.matches[0].utcStartSeconds;
        const playerStats = data.matches[0].playerStats;
        const mode = data.matches[0].mode;
        const loadout = data.matches[0].player.loadout[0];

        if (!loadout) {
          res.status(200).json({
            author:'Baje',
            msg:'2 joints',
            success: true,
            data: {
              get_Stats: {
                utcStartSeconds: utcStartSeconds,
                playerStats: playerStats,
                primaryWeapon: null,
                secondaryWeapon: null
              },
              competitive_report: {
                mode: mode,
                utcStartSeconds: utcStartSeconds,
                playerStats: playerStats,
              }
            },
            version: '2.0.0',
            code: '0'
          });
        } else {
          res.status(200).json({
            author:'Baje',
            msg:'2 joints',
            success: true,
            data: {
              get_Stats: {
                utcStartSeconds: utcStartSeconds,
                playerStats: playerStats,
                primaryWeapon: data.matches[0].player.loadout[0].primaryWeapon.name,
                secondaryWeapon: data.matches[0].player.loadout[0].secondaryWeapon.name
              },
              competitive_report: {
                mode: mode,
                utcStartSeconds: utcStartSeconds,
                playerStats: playerStats,
              }
            },
            version: '2.0.0',
            code: '0'
          });
        }

        // dito mo lulutuin ung hinimay mo s data hehe
        //sanitizedData = { ...data };

      } catch(err0) {
         console.log('[ERROR] ', err0);
         return sendError(res, err0);
      }
      //return sendSuccess(res, sanitizedData);
    }

    return sendError(res, 'Server failed.');
  //}
});

/*
router.post('/', function (req, res, next) {
  let token = config.getToken(req.headers);
  if (token) {
    .create(req.body, function (err, abdomen) {
      if (err) return sendError(res, 'Server failed.');
      return sendSuccess(res, abdomen);
    });
  }
});

router.get('/:id', function (req, res, next) {
  let token = config.getToken(req.headers);
  if (token) {
   .findById(req.params.id, function (err, abdomen) {
     if (err || !abdomen) return sendError(res, 'Server failed.');
     return sendSuccess(res, abdomen);
   });
 }
});

router.put('/:id', function (req, res, next) {
  let token = config.getToken(req.headers);
  if (token) {
    .findByIdAndUpdate(req.params.id, req.body, { new: true }, function (err, abdomen) {
      if (err || !abdomen) return sendError(res, 'Server failed.');
      return sendSuccess(res, abdomen);
    });
  }
});

router.delete('/:id', function (req, res, next) {
  let token = config.getToken(req.headers);
  if (token) {
    .findByIdAndRemove(req.params.id, req.body, function (err, abdomen) {
      if (err || !abdomen) return sendError(res, 'Server failed.');
      return sendSuccess(res, abdomen);
    });
  }
});
*/

module.exports = router;
