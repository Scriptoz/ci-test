// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "./TestLib.sol";

contract Lock is OwnableUpgradeable {
    string private _version;
    string private _purpose;

    function getVersion() external view returns (string memory) {
        return _version;
    }

    function getPurpose() external view returns (string memory) {
        return _purpose;
    }

    function test() public pure returns (uint256) {
        return 1;
    }

    function test2() public pure returns (uint256) {
        return 22;
    }

    function hello() public pure returns (string memory) {
        return TestLib.hello();
    }

    function upgradeVersion(string memory version, string memory purpose)
        external
        onlyOwner
    {
        require(bytes(version).length != 0, "OV1");

        _version = version;
        _purpose = purpose;
    }

}
