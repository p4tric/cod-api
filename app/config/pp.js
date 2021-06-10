var JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;

var config = require('./config');

module.exports = function(passport) {
  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = config.accessTokenSecret;

  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    done(null, jwt_payload);
  }));
};
