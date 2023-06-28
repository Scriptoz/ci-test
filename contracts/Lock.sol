// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "./TestLib.sol";

contract Lock is OwnableUpgradeable, UUPSUpgradeable {
    string private _version;
    string private _purpose;

    function __Lock_init() public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

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
        return 777;
    }

    function hello() public pure returns (string memory) {
        return TestLib.hello();
    }

    function upgradeVersion(
        string memory version,
        string memory purpose
    ) external onlyOwner {
        _version = version;
        _purpose = purpose;
    }
}
