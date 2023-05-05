//jshint esversion:6

var getDate = function () {
  const today = new Date();
  const options = { weekday: "long", day: "numeric", month: "long" };
  return today.toLocaleDateString("en-US", options);
};

var getDay = function () {
  const today = new Date();
  const options = { weekday: "long" };
  return today.toLocaleDateString("en-US", options);
};

exports.getDate = getDate;
exports.getDay = getDay;

console.log(module.exports);
