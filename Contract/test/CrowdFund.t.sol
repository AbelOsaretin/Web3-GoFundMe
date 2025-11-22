// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {CrowdFund} from "../src/CrowdFund.sol";
import {TestToken} from "../src/TestToken.sol";

contract CrowdFundTest is Test {
    CrowdFund public cf;
    TestToken public token;

    address public creator = address(0xABCD);
    address public alice = address(0xBEEF);
    address public bob = address(0xCAFE);

    function setUp() public {
        token = new TestToken();
        cf = new CrowdFund(address(token));

        // give some tokens to test accounts from the test contract (deployer of TestToken)
        token.transfer(creator, 1_000_000 ether);
        token.transfer(alice, 1_000_000 ether);
        token.transfer(bob, 1_000_000 ether);
    }

    function testLaunchAndGetCounts() public {
        uint32 startAt = uint32(block.timestamp);
        uint32 endAt = uint32(block.timestamp + 1 days);

        vm.prank(creator);
        cf.launch("Title", "Desc", "Cat", 100 ether, startAt, endAt);

        assertEq(cf.count(), 1);
        assertEq(cf.getTotalCampaigns(), 1);
    }

    function testCancelBeforeStart() public {
        uint32 startAt = uint32(block.timestamp + 2 days);
        uint32 endAt = uint32(block.timestamp + 3 days);

        vm.prank(creator);
        cf.launch("T", "D", "C", 100 ether, startAt, endAt);

        // cancel as creator before start
        vm.prank(creator);
        cf.cancel(1);

        (, , , address cCreator, , , , , ) = cf.campaigns(1);
        assertEq(cCreator, address(0));
    }

    function testPledgeAndUnpledge() public {
        uint32 startAt = uint32(block.timestamp);
        uint32 endAt = uint32(block.timestamp + 1 days);
        uint goal = 100 ether;
        uint amount = 10 ether;

        vm.prank(creator);
        cf.launch("T", "D", "C", goal, startAt, endAt);

        // Alice approves and pledges
        vm.prank(alice);
        token.approve(address(cf), amount);
        vm.prank(alice);
        cf.pledge(1, amount);

        assertEq(cf.pledgedAmount(1, alice), amount);
        (, , , , , uint pledged, , , ) = cf.campaigns(1);
        assertEq(pledged, amount);

        // unpledge
        vm.prank(alice);
        cf.unpledge(1, amount);

        assertEq(cf.pledgedAmount(1, alice), 0);
        (, , , , , pledged, , , ) = cf.campaigns(1);
        assertEq(pledged, 0);
    }

    function testClaimTransfersToCreatorWhenGoalReached() public {
        uint32 startAt = uint32(block.timestamp);
        uint32 endAt = uint32(block.timestamp + 1 days);
        uint goal = 100 ether;
        uint pledgeAmount = 150 ether;

        vm.prank(creator);
        cf.launch("T", "D", "C", goal, startAt, endAt);

        // Alice pledges more than goal
        vm.prank(alice);
        token.approve(address(cf), pledgeAmount);
        vm.prank(alice);
        cf.pledge(1, pledgeAmount);

        // move time to after campaign end
        vm.warp(block.timestamp + 2 days);

        // Claim as creator
        uint before = token.balanceOf(creator);
        vm.prank(creator);
        cf.claim(1);
        uint afterExecution = token.balanceOf(creator);

        (, , , , , , , , bool claimed) = cf.campaigns(1);
        assertTrue(claimed);
        assertEq(afterExecution - before, pledgeAmount);
    }

    function testRefundWhenGoalNotReached() public {
        uint32 startAt = uint32(block.timestamp);
        uint32 endAt = uint32(block.timestamp + 1 days);
        uint goal = 1_000 ether;
        uint pledgeAmount = 100 ether;

        vm.prank(creator);
        cf.launch("T", "D", "C", goal, startAt, endAt);

        // Alice pledges less than goal
        vm.prank(alice);
        token.approve(address(cf), pledgeAmount);
        vm.prank(alice);
        cf.pledge(1, pledgeAmount);

        // move time to after campaign end
        vm.warp(block.timestamp + 2 days);

        uint before = token.balanceOf(alice);
        vm.prank(alice);
        cf.refund(1);
        uint afterExecution = token.balanceOf(alice);

        assertEq(afterExecution - before, pledgeAmount);
        assertEq(cf.pledgedAmount(1, alice), 0);
    }

    function testOnlyCreatorCanClaim() public {
        uint32 startAt = uint32(block.timestamp);
        uint32 endAt = uint32(block.timestamp + 1 days);
        uint goal = 10 ether;
        uint pledgeAmount = 20 ether;

        vm.prank(creator);
        cf.launch("T", "D", "C", goal, startAt, endAt);

        vm.prank(alice);
        token.approve(address(cf), pledgeAmount);
        vm.prank(alice);
        cf.pledge(1, pledgeAmount);

        vm.warp(block.timestamp + 2 days);

        // Bob (not creator) can't claim
        vm.prank(bob);
        vm.expectRevert(bytes("not creator"));
        cf.claim(1);
    }
}
