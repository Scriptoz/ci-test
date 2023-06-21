// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "./TestLib.sol";

contract Lock is OwnableUpgradeable {
    function test() public pure returns (uint256) {
        return 1;
    }

    function test2() public pure returns (uint256) {
        return 2;
    }

    function hello() public pure returns (string memory) {
        return TestLib.hello();
    }
}
