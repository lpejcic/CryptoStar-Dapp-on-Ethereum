const StarNotary = artifacts.require("StarNotary");

module.exports = (deployer) => {
  deployer.deploy(StarNotary);
};
