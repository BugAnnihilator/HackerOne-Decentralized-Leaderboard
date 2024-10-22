// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

interface IhackerOneInterface {
    function getHackerData(string memory _userName) external returns (uint256);
}