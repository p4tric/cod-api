'use strict';

const express       = require('express'),
router              = express.Router(),
mongoose            = require('mongoose'),
passport            = require('passport'),
jwt                 = require('jsonwebtoken'),
bcrypt              = require('bcrypt'),
config              = require('../config/config'),
Vser                = require('../models/Vser.js'),
Whitelist           = require('../models/Whitelist.js'),
cron                = require('node-cron'),
jwtDecode           = require('jwt-decode');

const { sendError, sendSuccess } = require ('../utils/methods');

function generateAccessToken(user) {
  return jwt.sign(
    user.toJSON(),
    config.accessTokenSecret,
    { expiresIn: config.accessTokenLife }
  );
}

router.post('/validate-token', (req, res) => {
  const refreshToken = req.body.token

  if (refreshToken === null) return res.sendStatus(401);

  Whitelist.find({ token: refreshToken }, function (err, pat) {
    if (err) return next(err);
    if (pat.length === 0) {
      return res.status(403).json({
        author: 'p',
        success: false,
        data: {},
        version: '2.0.0',
        msg: 'Forbidden.',
        code: 101
      });
    }

    jwt.verify(refreshToken, config.refreshTokenSecret, (err, user) => {
      if (err) {
        res.status(403).json({
          author: 'p',
          success: false,
          data: {},
          version: '2.0.0',
          msg: 'Forbidden.',
          code: 0
        });
      } else {
        const token = jwt.sign(user, config.accessTokenSecret);
        res.json({
          author: 'p',
          success: true,
          data: { token },
          version: '2.0.0',
          msg: 'Validated token.',
          code: 0
        });
      }
    });
  });
});

// SIGN UP ??
router.post('/', function (req, res, next) {
  if (req.body.password !== req.body.password2) {
    return sendError(res, 'Password mismatch.');
  }

  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.password2) {

    var token = config.getToken(req.headers);
    if (token) {
      Vser.create(req.body, function (error, pat) {
        if (error) {
          return sendError(res, 'Sign up failed.');
        } else {
          pat.password = undefined;
          //req.session.userId = pat._id;
          res.json({
            author: 'jempillora',
            success: true,
            data: { token, user: pat },
            version: '2.0.0',
            msg: 'Sign-up successful.',
            code: 0
          });
          //return res.redirect('/profile');
        }
      });
    }
  } else if (req.body.email && req.body.password) {
    Vser.authenticate(req.body.email, req.body.password, function (error, user) {
      if (error || !user) {
        var err = Error();
        err.status = 401;
        err.message = 'Wrong email or password.';
        return next(err);
      } else {
        req.session.userId = user._id;

        var token = generateAccessToken(user);
        var refreshToken = jwt.sign(user.toJSON(), config.refreshTokenSecret,{ expiresIn: config.refreshTokenLife })

        Whitelist.create({ token: refreshToken }, function (err, whitelist) {
          if (err)
            return sendError(res, 'Failed to store refreshments.');

          res.json({
            author: 'p',
            success: true,
            data: { token, refreshToken },
            version: '2.0.0',
            msg: '',
            code: 0
          });
        });
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
});

// GET /logout
router.delete('/logout', function(req, res, next) {
  const token = req.body.token;
  if (!token) return next(err);
  if (req.session) {
    Whitelist.deleteMany({ token }, function (err, w) {
      if (err)
        return sendError(res, 'Failed to logout.');

      if (w.deletedCount > 0) {
        // delete session object
        req.session.destroy(function(err) {
          if (err) {
            return next(err);
          } else {
            res.json({
              author: 'jempillora',
              msg: 'Logged out.',
              success: true,
              data: {},
              version: '2.0.0',
              code: 0
            })
          }
        });
      } else {
        return sendError(res, 'Failed to logout.');
      }
      console.log('Removed refreshment ', w.deletedCount);
    });
  }
});


router.post('/login', function (req, res, next) {

  console.log('[LOGIN] ', req.body);

  if (req.body.email && req.body.password) {
    Vser.authenticate(req.body.email, req.body.password, function (error, user) {
      if (error || !user) {
        return sendError(res, error);
      } else {
        req.session.userId = user._id;

        user.password = undefined;
        var token = generateAccessToken(user);
        var refreshToken = jwt.sign(user.toJSON(), config.refreshTokenSecret,{ expiresIn: config.refreshTokenLife })

        Whitelist.create({ token: refreshToken }, function (err, whitelist) {
          if (err)
            return sendError(res, 'Failed to store refreshments.');

          res.json({
            author: 'p4tric',
            success: true,
            data: { token, refreshToken },
            version: '2.0.0',
            msg: '',
            code: 0
          });
        });
      }
    });
  } else {
    var err = new Error('Error');
    err.status = 400;
    return next(err);
  }
});

router.post('/verify', function (req, res, next) {
  console.log('[VERIFY] ', req.body);
  if (req.body.email && req.body.password) {
    Vser.authenticate(req.body.email, req.body.password, function (error, user) {
      if (error || !user) {
        return sendError(res, 'Verification failed.');
      } else {
        user.password = undefined;
        var token = generateAccessToken(user);
        return sendSuccess(res, { token });
      }
    });
  } else {
    var err = new Error('Error');
    err.status = 400;
    err.msg = 'Hopodoy';
    return next(err);
  }
});

module.exports = router;
