const isServer =
  Object.prototype.toString.call(
    typeof process !== 'undefined' ? process : 0,
  ) === '[object process]';
const isProduction = process.env.NODE_ENV === 'production';

module.exports = { isServer, isProduction };
