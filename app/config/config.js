
module.exports = {
  refreshTokenSecret: '88a0d3ded1bc5bcefaf33edf13bc5d7ea64aa17d8090d25334394486da0c81088e7d44900dbfcc6d013f8cc617cc1e84e5bda386efe3cb9e251b1fce330322be',
  accessTokenSecret: 'fc8c6dfb3d08888e672fd81b92f684f64cff99ac18bbf79a58f0caa16118024254ee2cc57f955322693080611b3f5b7a49587f985ccfb66ea408f606063ef0c8',
  refreshTokenLife: '1d',
  accessTokenLife: '1d',
  secret: 'codder',
  database: 'mongodb://localhost/cod',
  getToken: function (headers) {
    if (headers && headers.authorization) {
      var parted = headers.authorization.split(' ');
      if (parted.length === 2) {
        return parted[1];
      } else {
        return null;
      }
    } else {
      return null;
    }
  },
};

//mongoose.connect('mongodb://localhost/cod');
//mongoose.connect('mongodb://user:abcd1234@localhost/cod');
