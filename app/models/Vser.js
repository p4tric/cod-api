'use strict';

const mongoose              = require('mongoose');
const bcrypt                = require('bcrypt');
const passwordValidator     = require('password-validator');

const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

let VserSchema = new mongoose.Schema({
  password: { type: String, default: '' },
  email: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
});

//authenticate input against database
VserSchema.statics.authenticate = function (email, password, callback) {
  Vser.findOne({ email: email })
    .exec(function (err, user) {
      if (err) {
        return callback(err)
      } else if (!user) {
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          return callback(null, user);
        } else {
          return callback();
        }
      })
    });
}

// validate password
VserSchema.statics.validatePassword = function (password, callback) {

  // Create a schema
  var schema = new passwordValidator();

  // Add properties to it
  schema
  .is().min(10)                                    // Minimum length 10
  .is().max(10)                                    // Maximum length 10
  .has().digits(1)
  .has().uppercase(1)                               // Must have uppercase letters
  .has().lowercase()                               // Must have lowercase letters
  .has().symbols(1)
  .has().not().spaces()                            // Should not have spaces


  // Get a full list of rules which failed
  console.log(schema.validate(password, { list: true }));
  // => [ 'min', 'uppercase', 'digits' ]

  const gotError = schema.validate(password, { list: true });
  if (gotError.length > 0) {
    let errText = '';
    if (gotError.includes('min')) errText += 'Minimum of 10 characters. ';
    if (gotError.includes('max')) errText += 'Maximum of 10 characters. ';
    if (gotError.includes('digits')) errText += 'At least 1 digit. ';
    if (gotError.includes('uppercase')) errText += 'At least 1 uppercase character. ';
    if (gotError.includes('symbols')) errText += 'At least 1 special character. ';
    if (gotError.includes('spaces')) errText += 'No spaces allowed. ';

    var err = new Error();
    err.msg = `Password must be: ${errText}`;
    err.status = 400;
    return callback(err);
  } else {
    return callback();
  }
}

//hashing a password before saving it to the database
VserSchema.pre('save', function (next) {
  var user = this;
  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});

VserSchema.plugin(aggregatePaginate);

const Vser = mongoose.model('Vser', VserSchema);
module.exports = Vser;
