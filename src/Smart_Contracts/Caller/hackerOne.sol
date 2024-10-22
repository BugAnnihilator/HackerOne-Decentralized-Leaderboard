// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IhackerOneInterface.sol";

// 0xC12946242C453a62Ea230510d227abcd7A686cB7
contract H1LeaderBoardCal is Ownable {
    // Constructor
    constructor() Ownable(msg.sender) {
        // Ownable constructor now takes 'msg.sender' as the initial owner.
    }

    Hacker[] public Hackers;

    function getHackersCount() public view returns (uint256) {
        return Hackers.length;
    }

    IhackerOneInterface private HackerOneOracle;

    struct Hacker {
        string userName;
        uint256 totalReputation;
        uint256 totalReports;
        address wltAddress;
        string avatarUrl;
        uint256 impact;
    }

    address public oracleAddress;

    mapping(uint256 => bool) requests;
    mapping(uint256 => address) requestIdtoUserAddr;

    function setOracleAddress(address _address) external onlyOwner {
        HackerOneOracle = IhackerOneInterface(_address);
        oracleAddress = _address;
        emit OracleAddressChanged(_address);
    }

    function checkHackerExists(address __wltAddress)
        public
        view
        returns (
            bool exists,
            string memory userName,
            string memory avatarUrl,
            uint256 totalReputation,
            uint256 totalReports,
            uint256 impact
        )
    {
        for (uint256 i = 0; i < Hackers.length; i++) {
            if (Hackers[i].wltAddress == __wltAddress) {
                return (
                    true,
                    Hackers[i].userName,
                    Hackers[i].avatarUrl,
                    Hackers[i].totalReputation,
                    Hackers[i].totalReports,
                    Hackers[i].impact
                );
            }
        }
        return (false, "", "", 0, 0, 0); // Return default values when the hacker does not exist
    }

    function updateHacker(address __wltAddress) public {
        (bool isExisting, , , , , ) = checkHackerExists(msg.sender);
        require(
            msg.sender == __wltAddress && isExisting,
            "Requested wallet is not authoirzed for this user"
        );
        for (uint256 i = 0; i < Hackers.length; i++) {
            if (Hackers[i].wltAddress == __wltAddress) {
                string memory __userName = Hackers[i].userName;
                uint256 id = HackerOneOracle.getHackerData(__userName);
                requests[id] = true;
                requestIdtoUserAddr[id] = msg.sender;
                emit HackerDataRequested(id);
                break;
            }
        }
    }

    function removeHacker(address __wltAddress) public {
        require(msg.sender == __wltAddress);
        for (uint256 i = 0; i < Hackers.length; i++) {
            if (Hackers[i].wltAddress == __wltAddress) {
                Hackers[i] = Hackers[Hackers.length - 1];
                Hackers.pop();
            }
        }
    }

    function addHacker(string memory __userName) public {
        (bool isExisting, , , , , ) = checkHackerExists(msg.sender);
        require(!isExisting, "Hacker already exists.");
        uint256 id = HackerOneOracle.getHackerData(__userName);
        requests[id] = true;
        requestIdtoUserAddr[id] = msg.sender;
        emit HackerDataRequested(id);
    }

    function fulfillHackerRequest(
        string memory _userName,
        string memory _avatarUrl,
        uint256 _reputation,
        uint256 _totalReportCount,
        uint256 _impact,
        uint256 id
    ) external {
        require(requests[id], "Request is invalid or already fulfilled.");

        address _wltAdress = requestIdtoUserAddr[id];
        bool hackerFound = false;

        for (uint256 i = 0; i < Hackers.length; i++) {
            if (Hackers[i].wltAddress == _wltAdress) {
                // Update the hacker's profile with new data
                Hackers[i].avatarUrl = _avatarUrl;
                Hackers[i].totalReputation = _reputation;
                Hackers[i].totalReports = _totalReportCount;
                Hackers[i].impact = _impact;
                hackerFound = true; // Indicate that the hacker was found and updated
                break;
            }
        }

        // If hacker is not found, create a new profile outside the loop
        if (!hackerFound) {
            Hacker memory newProfile = Hacker(
                _userName,
                _reputation,
                _totalReportCount,
                requestIdtoUserAddr[id], // Get the user wallet address from the requestIdtoUser mappings
                _avatarUrl,
                _impact
            );

            Hackers.push(newProfile); // Add the new hacker to the leaderboard
        }

        delete requests[id]; // Remove the fulfilled request
        delete requestIdtoUserAddr[id]; // delete the wallet address
        emit HackerDataRecieved(id); // Emit received event
    }

    event OracleAddressChanged(address oracleAddress);
    event HackerDataRequested(uint256 id);
    event HackerDataRecieved(uint256 id);
}