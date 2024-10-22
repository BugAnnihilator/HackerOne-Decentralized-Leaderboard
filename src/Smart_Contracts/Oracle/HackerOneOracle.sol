// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

import "./Icaller.sol";

//0x6CfB4a73C1D9c827CA121A8BD51bF5784167B6Fb
contract HackerOneOracle {
    uint256 private randNonce = 0;

    struct Response {
        string avatarUrl; // URL to the avatar image
        uint256 reputation; // Hacker's reputation score
        uint256 totalReportCount; // Total number of reports submitted
        uint256 impact; // Rounded impact score
        string username; // Hacker Username
        address callerAddress;
    }

    mapping(uint256 => bool) private pendingRequests;
    mapping(uint256 => string) private pendingUserNameRequests;
    mapping(uint256 => Response[]) private idToResponses;

    function getHackerData(string memory _userName) external returns (uint256) {
        randNonce++;
        uint256 id = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender, randNonce))
        ) % 1000;
        pendingRequests[id] = true;
        pendingUserNameRequests[id] = _userName;
        emit DataFetchRequested(msg.sender, id, pendingUserNameRequests[id]);
        return id;
    }

    function returnHackerData(
        string memory _avatarUrl,
        uint256 _reputation,
        uint256 _totalReportCount,
        uint256 _impact,
        string memory _userName,
        address callerAddress,
        uint256 id
    ) external {
        require(pendingRequests[id], "Request not found.");

        // Add newest response to list
        Response memory res = Response(
            _avatarUrl,
            _reputation,
            _totalReportCount,
            _impact,
            _userName,
            callerAddress
        );
        idToResponses[id].push(res);

        // Clean up
        delete pendingRequests[id];

        // Fulfill request
        ICaller(callerAddress).fulfillHackerRequest(
            _userName,
            _avatarUrl,
            _reputation,
            _totalReportCount,
            _impact,
            id
        );

        emit HackerDataReturned(
            _avatarUrl,
            _reputation,
            _totalReportCount,
            _impact,
            _userName,
            callerAddress,
            id
        );
    }

    event DataFetchRequested(
        address _callerAddress,
        uint256 _id,
        string _pendingRequests
    );
    event HackerDataReturned(
        string _avatarUrl,
        uint256 _reputation,
        uint256 _totalReportCount,
        uint256 _impact,
        string _userName,
        address callerAddress,
        uint256 id
    );
}