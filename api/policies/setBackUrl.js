/**
 * Setting the back url
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
module.exports = function (req, res, next) {

  // console.log('Received HTTP request: '+req.method+' '+req.path);

  return next();
};