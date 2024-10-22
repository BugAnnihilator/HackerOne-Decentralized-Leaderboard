// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

interface ICaller {
    function fulfillHackerRequest(
        string memory _userName,
        string memory _avatarUrl,
        uint256 _reputation,
        uint256 _totalReportCount,
        uint256 _impact,
        uint256 id
    ) external;
}