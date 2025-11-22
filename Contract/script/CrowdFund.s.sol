// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {TestToken} from "../src/TestToken.sol";
import {CrowdFund} from "../src//CrowdFund.sol";

contract CrowdFundScript is Script {
    TestToken public token;

    CrowdFund public crowdFund;

    function setUp() public {}

    function run() public {
        // start broadcasting transactions (uses the private key from --private-key or env)
        vm.startBroadcast();

        // deploy a TestToken

        token = new TestToken();

        // deploy the CrowdFund contract

        crowdFund = new CrowdFund(address(token));

        vm.stopBroadcast();
    }
}

// TestNet Command:
//  forge script script/CrowdFund.s.sol:CrowdFundScript --rpc-url $BASESEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY

// MainNet Command:
// forge script script/CrowdFund.s.sol:CrowdFundScript --rpc-url $BASEMAINNET_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY
