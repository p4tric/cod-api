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

const { checkTimestamp, sendError, sendSuccess } = require ('../utils/methods');

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
    let data1;
    let data2 = undefined;
    let sanitizedData;

    if (req.query.gametag && req.query.platform) {
      const { gametag, platform } = req.query;
      try {     
        const API = require('call-of-duty-api')({ platform });
        const res1 = await API.login(
          'jadokodeih@gmail.com',
          'jadoma99'
        );
        // ALLOWED: psn, xbl, battle, steam
        const mutatedGameTag = gametag.replace(/%23/g, '#');
        console.log('[mutatedGameTag] ', mutatedGameTag);
        
        data = await API.MWcombatwz(mutatedGameTag, platform);
        if (req.query.search) {
          data2 = await API.FuzzySearch(req.query.search, 'all');
        }
        // FOR LOGGED USERS ONLY
        // data1 = await API.Settings(mutatedGameTag, platform);

        const sortedMatches = data.matches
          .sort((a, b) => (a.utcEndSeconds > b.utcEndSeconds) ? -1 : 1);
        
        let kills;
        let teamPlacement
        if (sortedMatches.length > 0) {
          kills = sortedMatches[0].playerStats.kills;
          teamPlacement = sortedMatches[0].playerStats.teamPlacement;
        }

        sanitizedData = {
          // data,
          /*
          teamPlacement: data.matches.map(m => {
            return {
              mode: m.mode,
              tp: m.playerStats.teamPlacement,
            };
          }),
          */
          latest: {
            kills: kills ? kills : null,
            teamPlacement: teamPlacement ? teamPlacement : null,
            match: sortedMatches.length > 0 ? sortedMatches[0] : null,
          },
          get_Stats: data.summary.all,
          // settings: data1,
          competitive_report: sortedMatches.map(match => {
            return { ...match };
          }),
          results: data2,
        };         
      } catch(err0) {
         console.log('[ERROR] ', err0);
         return sendError(res, err0);
      }
      return sendSuccess(res, sanitizedData);
    }
    
    return sendError(res, 'Please include valid gamertag, platform');
  //}
});

/*
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
*/

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
