const { DEFAULT_AWS_REGION } =  require("./constants");

module.exports = [
  { name: "bucket", alias: "b", type: String },
  { name: "region", alias: "r", type: String, defaultValue: DEFAULT_AWS_REGION },
  { name: "parallel", alias: "p", type: Boolean, defaultValue: false },
  { name: "src", type: String, multiple: true, defaultOption: true },
  { name: "help", alias: "h", type: Boolean }
];
