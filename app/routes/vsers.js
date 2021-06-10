'use strict';

const express       = require('express'),
router              = express.Router(),
mongoose            = require('mongoose'),
passport            = require('passport'),
jwt                 = require('jsonwebtoken'), //express-jwt'),
bcrypt              = require('bcrypt'),
uuidv1              = require('uuid/v1'),
uuidv4              = require('uuid/v4'),
config              = require('../config/config'),
Vser             = require('../models/Vser.js');

require('../config/pp')(passport);

const { sendError, sendSuccess } = require ('../utils/methods');

/* GET vser listing. */
/* GET acu listing. */
router.get('/', function(req, res, next) {
  let token = config.getToken(req.headers);
  if (token) {
    if (req.query.pageIndex && req.query.pageSize && !req.query.userId) {
      const { pageIndex, pageSize } = req.query;
      var aggregateQuery = Vser.aggregate();
      const page = pageIndex;
      const limit = pageSize;
      Vser.aggregatePaginate(aggregateQuery, { page, limit },
        (err, result) => {
        if (err) {
         return sendError(res, 'Server failed.');
        } else {
          return sendSuccess(res, result);
        }
      });
    }

    if (req.query.pageIndex && req.query.pageSize && req.query.userId) {
      const { pageIndex, pageSize } = req.query;
      var aggregateQuery = Vser.aggregate([{
        $match: { id: req.query.userId }
      }]);
      const page = pageIndex;
      const limit = pageSize;
      Vser.aggregatePaginate(aggregateQuery,
        { page, limit },
        (err, result) => {
        if (err) {
          return sendError(res, 'Server failed.');
        } else {
          return sendSuccess(res, result);
        }
      });
    }
  }
});

/* POST /vser */
router.post('/', function (req, res, next) {
  let token = config.getToken(req.headers);
  if (token) {
    Vser.validatePassword(req.body.password, function (error) {
      if (error)
        return sendError(res, error.msg);

      Vser.create(req.body, function (err, vser) {
        if (err) return sendError(res, 'Server failed.');
        return sendSuccess(res, vser);
      });
    });
  }
});

/* GET /vser/:id */
router.get('/:id', function (req, res, next) {
  let token = config.getToken(req.headers);
  if (token) {
   Vser.findById(req.params.id, function (err, vser) {
     if (err || !vser) return sendError(res, 'Server failed.');
     return sendSuccess(res, vser);
   });
 }
});

/* PUT /vser/:id */
router.put('/:id', function (req, res, next) {
  let token = config.getToken(req.headers);
  if (token) {
    Vser.findByIdAndUpdate(req.params.id, req.body, { new: true }, function (err, vser) {
      if (err || !vser) return sendError(res, 'Server failed.');
      return sendSuccess(res, vser);
    });
  }
});

/* DELETE MANY */
router.delete("/", function(req, res) {
  let token = config.getToken(req.headers);
  if (token && req.query.ids) {
    const ids = req.query.ids.split(',');
    Vser.deleteMany({ _id: { $in: ids }},
      function(err, pat) {
        if (err || !pat) sendError(res, 'Delete failed.');
        return sendSuccess(res, pat, 'Records deleted.');
      }
    );
  }
});

/* DELETE /vser/:id */
router.delete('/:id', function (req, res, next) {
  let token = config.getToken(req.headers);
  if (token) {
    Vser.findByIdAndRemove(req.params.id, req.body, function (err, vser) {
      if (err || !vser) return sendError(res, 'Server failed.');
      return sendSuccess(res, vser);
    });
  }
});

module.exports = router;
