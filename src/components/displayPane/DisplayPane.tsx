import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { Typography, Input, Button, message } from "antd";
import { ethers } from "ethers";
import { useWindowSize } from "hooks";
import { Status } from "./components";
import HackerOneLeaderboard from "../HackerOneLeaderboard/HackerOneLeaderboard";
import { HACKERONE_CONTRACT_ADDRESS } from "../../data/constants/contract_address";

const { Title } = Typography;
const LEADERBOARD_ABI = require("../../data/abi/Hackerone.json");


interface HackerData {
  isExisting: boolean;
  userName: string;
  totalReputation: number;
  totalReports: number;
  avatarUrl: string;
  impact: number;
}

const styles = {
  container: {
    width: "80%",
    minWidth: "330px",
    maxWidth: "900px",
    textAlign: "center",
    margin: "auto",
    padding: "20px 0",
    borderRadius: "10px",
    boxShadow: "0px 0px 30px 30px rgba(30, 136, 229, 0.2)"
  },
  content: {
    width: "85%",
    margin: "auto",
    fontSize: "17px"
  },
  action: {
    display: "inline-flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "20px"
  }
} as const;

type DisplayPaneProps = {
  isDarkMode: boolean;
};

const LEADERBOARD_CONTRACT_ADDRESS = HACKERONE_CONTRACT_ADDRESS;

const DisplayPane: React.FC<DisplayPaneProps> = ({ isDarkMode }) => {
  const { isActivating, isActive, account, provider } = useWeb3React();
  const { isTablet } = useWindowSize();
  const [username, setUsername] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [hackerData, setHackerData] = useState<HackerData | null>(null);

  const [hackeroneContract, setHackeroneContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (isActive && provider) {
      setHackeroneContract(new ethers.Contract(LEADERBOARD_CONTRACT_ADDRESS, LEADERBOARD_ABI, provider.getSigner()));
    }
  }, [isActive, provider]);

  useEffect(() => {
    if (isActive && account && hackeroneContract) {
      checkHackerStatus(account);
    }
  }, [isActive, account, hackeroneContract]);

  const checkHackerStatus = async (address: string) => {
    try {
      const result = await hackeroneContract?.checkHackerExists(address);
      if (result) {
        const [exists, userName, avatarUrl, totalReputation, totalReports, impact] = result;

        // Update the state with the fetched hacker data
        setHackerData({
          isExisting: exists,
          userName,
          totalReputation: totalReputation.toNumber(),
          totalReports: totalReports.toNumber(),
          avatarUrl,
          impact: impact.toNumber(),
        });
        console.log("Hacker status:", hackerData);
        if (exists) {
          message.success(`Hacker status checked: Wallet linked with HackerOne account!`);
        }
        else {
          message.info(`Hacker status checked: Wallet not linked with HackerOne account!`);
        }
      }
    } catch (error) {
      console.error("Error checking hacker status:", error);
      message.error("Failed to check hacker status. Please try again.");
    }
  };
  const addToLeaderboard = async (username: string) => {
    try {
      message.loading("Fetching hacker data...", 0); // Duration '0' means it will persist until manually closed
      const result = await hackeroneContract?.addHacker(username);
      hackeroneContract?.on("HackerDataRecieved", (id: string) => {
        if (id === result?.id) {
          message.success("Hacker Added Successfully to the Leaderboard");
          window.location.reload();
        }
      });
    } catch (error) {
      console.error(error);
    }
  };


  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleSubmit = async () => {
    await addToLeaderboard(username);
    setUsername("");
  };

  const updateLeaderboard = () => {
    console.log("Updating leaderboard");
    // Implement the logic to update the leaderboard
  };

  const removeFromLeaderboard = async () => {
    try {
      message.loading("Deleting the account...", 0);
      const result = await hackeroneContract?.removeHacker(account);
      const receipt = await result.wait();
      if (receipt.status === 1) {
        message.success("Hacker Removed Successfully from the Leaderboard");
        window.location.reload();
      } else {
        message.error("Failed to remove hacker from leaderboard");
      }
    } catch (error) {
      message.error("Failed to remove hacker from leaderboard");
    }
  };
  const toggleLeaderboard = () => {
    setShowLeaderboard(!showLeaderboard);
  };

  return (
    <div
      style={{
        ...styles.container,
        border: isDarkMode ? "1px solid rgba(152, 161, 192, 0.24)" : "none",
        width: isTablet ? "90%" : "80%",
        position: "relative"
      }}
    >

      <Status isActivating={isActivating} isActive={isActive} account={account} hackeroneContract={hackeroneContract} />
      <Title>{isActive ? "Your HackerOne Profile" : "Connect your Wallet"}</Title>



      <div style={styles.content}>

        {hackerData?.isExisting && (
          <div style={{
            marginTop: "30px",
            marginLeft: "20px",
            marginRight: "20px",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
            background: isDarkMode ? "#2c3e50" : "#ffffff",
            color: isDarkMode ? "#ecf0f1" : "#2c3e50",
            transition: "all 0.3s ease"
          }}>
            <div style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              overflow: "hidden",
              margin: "0 auto 20px",
              border: `3px solid ${isDarkMode ? "#3498db" : "#2980b9"}`
            }}>
              <img src={hackerData.avatarUrl} alt="Hacker Avatar" style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }} />
            </div>
            <h2 style={{
              fontSize: "24px",
              marginBottom: "20px",
              textAlign: "center",
              color: isDarkMode ? "#3498db" : "#2980b9"
            }}>{hackerData.userName}</h2>
            <div style={{
              display: "flex",
              justifyContent: "space-around",
              flexWrap: "wrap"
            }}>
              <div style={{
                flex: "1 1 200px",
                margin: "10px",
                padding: "15px",
                borderRadius: "8px",
                background: isDarkMode ? "#34495e" : "#ecf0f1",
                textAlign: "center"
              }}>
                <h3 style={{ marginBottom: "10px", color: isDarkMode ? "#f39c12" : "#d35400" }}> Reports</h3>
                <p>{hackerData.totalReports}</p>
              </div>
              <div style={{
                flex: "1 1 200px",
                margin: "10px",
                padding: "15px",
                borderRadius: "8px",
                background: isDarkMode ? "#34495e" : "#ecf0f1",
                textAlign: "center"
              }}>
                <h3 style={{ marginBottom: "10px", color: isDarkMode ? "#f39c12" : "#d35400" }}>Reputation</h3>
                <p>{hackerData.totalReputation}</p>
              </div>
              <div style={{
                flex: "1 1 200px",
                margin: "10px",
                padding: "15px",
                borderRadius: "8px",
                background: isDarkMode ? "#34495e" : "#ecf0f1",
                textAlign: "center"
              }}>
                <h3 style={{ marginBottom: "10px", color: isDarkMode ? "#f39c12" : "#d35400" }}>Impact</h3>
                <p>{hackerData.impact}</p>
              </div>
            </div>
          </div>
        )}

        {isActive && hackerData && (
          <>
            <div style={{ marginTop: "20px" }}>

              {hackerData && !hackerData.isExisting && <Input
                placeholder="Enter your HackerOne username"
                value={username}
                onChange={handleUsernameChange}
                style={{
                  marginBottom: "10px",
                  width: "100%",
                  padding: "12px",
                  fontSize: "16px",
                  borderRadius: "8px",
                  border: "2px solid #1e88e5",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease"
                }}
              />}
              {hackerData && !hackerData.isExisting && (
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    borderRadius: "8px",
                    background: "linear-gradient(45deg, #1e88e5, #1565c0)",
                    border: "none",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease"
                  }}
                >
                  Add to Leaderboard
                </Button>
              )}
            </div>
            <div style={{ marginTop: "20px" }}>
              {hackerData && hackerData.isExisting && <Button
                onClick={updateLeaderboard}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  background: "rgb(252, 169, 3)",
                  border: "none",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease"
                }}
              >
                Update Leaderboard
              </Button>}
              {hackerData && hackerData.isExisting && <Button
                onClick={removeFromLeaderboard}
                style={{ width: "100%", marginBottom: "10px", marginTop: "10px" }}
                danger
              >
                Remove Account from Leaderboard
              </Button>}
            </div>

          </>
        )}
      </div>

      {isActive && <Button
        onClick={toggleLeaderboard}
        style={{
          marginTop: "18px",
          display: "block",
          margin: "18px auto 0",
          fontSize: "16px",
          fontWeight: "bold",
          color: "#ffffff",
          backgroundColor: "#3498db",
          border: "none",
          borderRadius: "25px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          transition: "all 0.3s ease",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <span style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {showLeaderboard ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "10px" }}>
                <path d="M18 15l-6-6-6 6" />
              </svg>
              Hide Leaderboard
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "10px" }}>
                <path d="M6 9l6 6 6-6" />
              </svg>
              Show Leaderboard
            </>
          )}
        </span>
      </Button>}
      {showLeaderboard && (
        <div style={{ padding: "20px" }}>
          <HackerOneLeaderboard />
        </div>
      )}


    </div>
  );
}; export default DisplayPane;          
