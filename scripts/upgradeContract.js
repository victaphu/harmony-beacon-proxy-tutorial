const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

const BEACON_ADDRESS = "0xC3189125cf97ce1a868Ac551d745041d346AD224"
const BEACON_PROXY_ADDRESS = "0xB7b9CAb3B5ABd9ac543348f93a640eeEFb0047F4";
async function main() {
  // Deploying
  const BoxV2 = await ethers.getContractFactory("BoxV2");

  console.log("Upgrading Box to BoxV2");
  await upgrades.upgradeBeacon(BEACON_ADDRESS, BoxV2);

  console.log("Beacon updated!");
  const box = BoxV2.attach(BEACON_PROXY_ADDRESS);
  await box.setY(55);

  console.log("Box upgraded", box.address, await box.y());
}

main();