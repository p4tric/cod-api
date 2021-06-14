const moment = require ('moment')

const authors = ['darkly_noon970', '@p4tric'];

const randomAuthor = () => {
  const l = authors[Math.floor(Math.random() * authors.length)];
  return l;
};

/**
 * convert moment
 * @param {*} params
 */
exports.convertMomentWithFormat = (v) => {
  return moment(v).format('MM/DD/YYYY');
};

/**
 * convert moment
 * @param {*} params
 */
exports.convertToMomentObj = (v) => {
  return moment(v);
};

exports.sendError = (v, msg) => {
  return v.status(400).json({
    author: randomAuthor(),
    msg,
    data: {},
    success: false,
    version: '2.0.0',
    code: 101
  });
};

exports.sendSuccess = (v, data, msg = '') => {
  return v.json({
    author: randomAuthor(),
    msg,
    success: true,
    data,
    version: '2.0.0',
    code: 0
  });
};

exports.checkTimestamp = (v) => {
  console.log('[checkTimestamp] ', (v * 1000) < Date.now());
  return (v * 1000) < Date.now();
};