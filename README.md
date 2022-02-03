# Harmony Contract Verification Tutorial - Beacon Proxy
Tutorial for harmony contract verification of Beacon proxies using hardhat-etherscan  
This is part of a 3-part tutorial for contract verification of open zeppelin proxies:  
- [Transparent Proxies](https://github.com/victaphu/harmony-transparent-proxy-tutorial)
- [UUPS Proxies](https://github.com/victaphu/harmony-uups-proxy-tutorial)
- [Beacon Proxies](https://github.com/victaphu/harmony-beacon-proxy-tutorial)

## What are beacon proxies?
Beacon proxies are a new form of proxy allowing multiple proxies to be upgraded to a different implementation in a single transaction. The proxy doesn't hold the implementation address in storage, but rather the address is held in an upgradeable beacon contract. Any upgrades are sent to the beacon contract and all proxies following that beacon are automatically upgraded.

Prerequisites  
- Hardhat installed globally (https://hardhat.org/getting-started/)
- Install npx and npm version 16

To begin  
- npm install
- configure hardhat.config.js (https://hardhat.org/config/) (we included a copy of the configuration in the repo)
- configure .env file with PRIVATE_KEY (this setting is your private key that holds funds to be used for deployment)
- npx hardhat compile
- npx hardhat run --network harmony scripts/deployContract.js (deploy to harmony testnet)

> Record the output of the deployed beacon and implementation; this will be used for verification later on

Example:
```
Compiling 14 files with 0.8.2

Solidity compilation finished successfully
Beacon deployed to: 0xC3189125cf97ce1a868Ac551d745041d346AD224
Box deployed to: 0xB7b9CAb3B5ABd9ac543348f93a640eeEFb0047F4```
```
> When deploying proxy contracts, hardhat takes care of deploying the proxy and linking the implementation. This information is stored in the .openzeppelin/networkid.json file (in our case its unknown-1666700000.json).  
> 
> **The output of the script is the proxy contract address and beacon (not the implementation). Please take note of the Beacon address as this is not recorded in the json file or environment**  


# Verifying using hardhat-etherscan
The hardhat-etherscan module has been modified to support Harmony One. Please make sure that you include the correct package (see package.json).

Verifying beacon contracts are a three-part process  
1. Verify the implementation contract  
2. Verify the upgradeable beacon contract
3. Verify the beacon proxy itself  


## Verifying the implementation
To verify the implementation contract we will need the address of the implementation (note: running the deployContract script will output the beacon proxy contract and its upgradeable beacon, we still need to find the implementation contracts). All contract address information pertaining to proxy deployment can be found in file:
```
.openzeppelin/unknown-1666700000.json 
```
Once the deployContract script completes, this file will be updated with the latest version of the deployed contract addresses. In this file we will need the "impls" property, under which the address property will contain our deployed contract address.

Example:
```
"impls": {
    "332366155e9de80523247efae7f7eb103c49b84f7a5cc33c9da258256e97ad57": {
      "address": "0x12d04cE43F7F7891d1A3b5B4bACFc5d97091d67B",
      "txHash": "0xc06b6d0e7b36e2f42be028b677e02a9c9fb232fd072be5060370f660cd427eb9",
```
With the contract address (in our case 0x12d04cE43F7F7891d1A3b5B4bACFc5d97091d67B), run the following command to verify the contract:
```
npx hardhat verify --network harmony 0x12d04cE43F7F7891d1A3b5B4bACFc5d97091d67B
```
If everything works then you should see the following output (superflous output removed):
```
Compiling 1 file with 0.8.2
--> contracts/Box.sol

Successfully submitted source code for contract
contracts/Box.sol:Box at 0x12d04cE43F7F7891d1A3b5B4bACFc5d97091d67B
for verification on the block explorer. Waiting for verification result...

Successfully verified contract Box on Etherscan.
https://explorer.harmony.one/address/0x12d04cE43F7F7891d1A3b5B4bACFc5d97091d67B#code
```

If you reach this point then your implementation contract has been deployed and now you can move on to verifying the proxy contract itself.

## Verifying the Upgradeable Beacon
Beacon verification involves supplying the arguments used to create the beacon and using the contract address output by the deployContract script as input to hardhat's verification process.

For a Beacon, we need the following arguments  
- Beacon contract address (output from the deployContract script; in our example the value is 0xC3189125cf97ce1a868Ac551d745041d346AD224)
- Implementation contract address (found in previous steps, in our example it is 0x12d04cE43F7F7891d1A3b5B4bACFc5d97091d67B)

> Note: the beacon contract address is output once when the deployContract script is run. Please take care to record this value as **it is not stored by Open Zeppelin in any generated files.**

With the above information, we can run the verify function to verify the beacon contract. The first address provided is your beacon address (0xC3189125cf97ce1a868Ac551d745041d346AD224), and the second is the implementation contract address (0x12d04cE43F7F7891d1A3b5B4bACFc5d97091d67B).

```
npx hardhat verify --network harmony 0xC3189125cf97ce1a868Ac551d745041d346AD224 0x12d04cE43F7F7891d1A3b5B4bACFc5d97091d67B
```

If everything works then you will receive the following message confirming that the contract has been successfully verified:
```
Compiling 1 file with 0.8.2
Successfully submitted source code for contract
@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol:UpgradeableBeacon at 0xC3189125cf97ce1a868Ac551d745041d346AD224
for verification on the block explorer. Waiting for verification result...

Successfully verified contract UpgradeableBeacon on Etherscan.
https://explorer.harmony.one/address/0xC3189125cf97ce1a868Ac551d745041d346AD224#code
```

Refer to verification troubleshooting below if you encounter any issues during the verification process. Make sure to double-check all the values supplied to the verification script.

## Verifying the Beacon Proxy
Beacon Proxy verification involves supplying the arguments used to create the proxy and using the contract address output by the deployContract script as input to hardhat's verification process.

For Beacon Proxy, we need the following arguments:  
- Upgradeable contract address (0xC3189125cf97ce1a868Ac551d745041d346AD224)
- Argument(s) supplied when we deployed our implementation as a proxy (in our example the argument supplied was 42, refer to scripts/deployContract.js for more information)
- Beacon Proxy Contract address (output from our script, in our example it is 0xB7b9CAb3B5ABd9ac543348f93a640eeEFb0047F4)

The Beacon Proxy contract address can be found in the .openzeppelin/unknown-1666700000.json file under the proxies property:
```
"proxies": [
    {
      "address": "0xB7b9CAb3B5ABd9ac543348f93a640eeEFb0047F4",
      "txHash": "0xd1f6a75619c4b1cd8ead4a1aa8a6f60ac147bc54dd65323b7e49b68d03ce2925",
      "kind": "beacon"
    }
  ],
```

Hardhat takes a js file it uses to read the arguments; in our example you can find an argument.js file which contains the following (which you should fill in with your own value found using the previous set of steps):
```
module.exports = [
    "0xC3189125cf97ce1a868Ac551d745041d346AD224", // Upgradeable Beacon address
    42 // argument(s)
  ];
```
With this information we can now verify the beacon proxy contract using the following command:
```
npx hardhat verify --network harmony 0x2172C790E45fbEdAAbaD13DD650fb7761a450BF3 --constructor-args scripts/arguments.js
```

If everything works then you will receive the following message confirming that the contract has been successfully verified:
```
Compiling 1 file with 0.8.2
Successfully submitted source code for contract
@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol:BeaconProxy at 0xB7b9CAb3B5ABd9ac543348f93a640eeEFb0047F4
for verification on the block explorer. Waiting for verification result...

Successfully verified contract BeaconProxy on Etherscan.
https://explorer.harmony.one/address/0xB7b9CAb3B5ABd9ac543348f93a640eeEFb0047F4#code
```

Refer to verification troubleshooting below if you encounter any issues during the verification process. Make sure to double-check all the values in arguments.js and that the proxy contract address is correct.

## Verifying upgraded contracts
Time to time you will be upgrading your contracts. In our example we will upgrade Box.sol to BoxV2.sol and introduce an additional variable (y). Refer to https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable for rules on writing upgradeable smart contracts.

To upgrade our proxy, open the upgradeContract.js file and edit the BEACON_ADDRESS and BEACON_PROXY_ADDRESS value to the contract address of the beacon and proxy you deployed (in our example, BEACON_ADDRESS = 0xC3189125cf97ce1a868Ac551d745041d346AD224 and BEACON_PROXY_ADDRESS = 0xB7b9CAb3B5ABd9ac543348f93a640eeEFb0047F4)

```
const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

const BEACON_ADDRESS = "0xC3189125cf97ce1a868Ac551d745041d346AD224"
const BEACON_PROXY_ADDRESS = "0xB7b9CAb3B5ABd9ac543348f93a640eeEFb0047F4";
```

Run the upgrade script with the following command:
```
npx hardhat run --network harmony scripts/upgradeContract.js
```

If everything goes well you will receive something similar to the following output:
```
Upgrading Box to BoxV2
Beacon updated!
Box upgraded 0xB7b9CAb3B5ABd9ac543348f93a640eeEFb0047F4 BigNumber { value: "55" }
```

You can confirm the contract has been upgraded by navigating to the [explorer](https://explorer-2.netlify.app/address/0xb7b9cab3b5abd9ac543348f93a640eeefb0047f4?activeTab=7) and viewing the contract proxy, its implementation will have changed to the latest implementation address.
Example (you should see a Box and BoxV2 implementation with different addresses):
```
"impls": {
    "332366155e9de80523247efae7f7eb103c49b84f7a5cc33c9da258256e97ad57": {
      "address": "0x12d04cE43F7F7891d1A3b5B4bACFc5d97091d67B",
      "txHash": "0xc06b6d0e7b36e2f42be028b677e02a9c9fb232fd072be5060370f660cd427eb9",
      ...
    }
    "73a7433f13ecd3ebe4ca96767df9477fcfa4bca56eac9b023bb91f4ee74096ca": {
      "address": "0xB5c291690Ad073cA57Fe11249E0495a11391A8B8",
      "txHash": "0x326474f422def27402ce0fbe192a5602a74a4ffecc7ea061a3f81b8b4cd77712",
```

You can also refer to the .openzeppelin/unknown-1666700000.json file which will show your second (BoxV2) contract with its address.

> Make sure you verify your newly deployed implementation contract using the same step above (with the new address). In our example, we would use address 0xB5c291690Ad073cA57Fe11249E0495a11391A8B8)

## Verification Troubleshooting
If you receive the following error message then confirm if you have the correct version of open-zeppelin/contracts and open-zeppelin/contracts-upgradeable vs the hardhat-upgrades libraries. 

```
Error in plugin @nomiclabs/hardhat-etherscan: The address provided as argument contains a contract, but its bytecode doesn't match any of your local contracts.

Possible causes are:
  - Contract code changed after the deployment was executed. This includes code for seemingly unrelated contracts.
  - A solidity file was added, moved, deleted or renamed after the deployment was executed. This includes files for seemingly unrelated contracts.
  - Solidity compiler settings were modified after the deployment was executed (like the optimizer, target EVM, etc.).
  - The given address is wrong.
  - The selected network (harmony) is wrong.
```

> You can verify by browsing the specific installed version. Refer to this repository's package.json, we are using 4.1.0 of openzeppelin. Since contract verification relies on bytecode matches, it is important the proxy used by hardhat-upgrades matches what you have in your environment.

# Deploying your own smart contract proxies
Hardhat hides a lot of the proxy deployment complexity. If you are planning to use this in a project and want to use Hardhat to verify the contract you will need to include the proxies as part of your compiled contracts (so Hardhat knows how to find the contract bytecode and match with what is deployed in the Harmony Explorer).  

A simple way to include the required contracts into your project is to create an empty contract importing the necessary open zeppelin proxy contracts:

```
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

contract Infer {
    
}
```
Add this into your contract directory and hardhat will be able to find the upgradeable beacon and beacon proxy contracts and verify them automatically  