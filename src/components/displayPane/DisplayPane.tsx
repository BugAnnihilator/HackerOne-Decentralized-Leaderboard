import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { Typography, Input, Button, message } from "antd";
const { Title } = Typography;
import { ethers } from "ethers";
import { useWindowSize } from "hooks";
import { Status } from "./components";
import HackerOneLeaderboard from "../HackerOneLeaderboard/HackerOneLeaderboard";
import { useLeaderboard } from "../../hooks/useLeaderboard";

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

const LEADERBOARD_CONTRACT_ADDRESS = "0x89AA40a7ffDafc4533f367f693445F60f14B5eAB";
const LEADERBOARD_ABI = require("../../data/abi/Hackerone.json");

const DisplayPane: React.FC<DisplayPaneProps> = ({ isDarkMode }) => {
  const { isActivating, isActive, account, provider } = useWeb3React();
  const { isTablet } = useWindowSize();  const [username, setUsername] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isHacker, setIsHacker] = useState<boolean | null>(null);

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
      setIsHacker(result);
      console.log("Hacker status:", result);
      message.success(`Hacker status checked: ${result ? 'Wallet liked with HackerOne account!' : 'Wallet not liked with HackerOne account!'}`);
    } catch (error) {
      console.error("Error checking hacker status:", error);
      message.error("Failed to check hacker status. Please try again.");
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

  const removeFromLeaderboard = () => {
    console.log("Removing account from leaderboard:", username);
    // Implement the logic to remove the account from the leaderboard
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
      <Title>{isActive ? "Your HackerOne Profile" : "Connect your Wallet"}</Title>
      <div style={styles.content}>
        <Status isActivating={isActivating} isActive={isActive} />
        {isActive && (
          <>
            <div style={{ marginTop: "20px" }}>
            
              <Input
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
              />
              {!isHacker && (
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
              <Button
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
              </Button>
              <Button
                onClick={removeFromLeaderboard}
                style={{ width: "100%", marginBottom: "10px",marginTop: "10px" }}
                danger
              >
                Remove Account from Leaderboard
              </Button>
            </div>
            {isActive && <Button
              onClick={toggleLeaderboard}
              style={{
                marginTop: "18px"
              }}
            >
              {showLeaderboard ? "Hide Leaderboard" : "Show Leaderboard"}
            </Button>}
          </>
        )}
      </div>
      {showLeaderboard && (
        <div style={{ padding: "20px" }}>
          <HackerOneLeaderboard />
        </div>
      )}
    </div>
  );
};

export default DisplayPane;