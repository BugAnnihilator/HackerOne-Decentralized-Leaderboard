import type { Web3ReactHooks } from "@web3-react/core";
import { Typography, message } from "antd";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

const { Paragraph } = Typography;

const LEADERBOARD_CONTRACT_ADDRESS = "0x89AA40a7ffDafc4533f367f693445F60f14B5eAB";
const LEADERBOARD_ABI = require("../../../data/abi/Hackerone.json");

const Status = ({
  isActivating,
  isActive,
  provider,
  account
}: {
  isActivating: ReturnType<Web3ReactHooks["useIsActivating"]>;
  isActive: ReturnType<Web3ReactHooks["useIsActive"]>;
  provider: any;
  account: string | undefined;
}) => {
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
      message.success(`Hacker status checked: ${result ? 'You are a hacker!' : 'You are not a hacker.'}`);
    } catch (error) {
      console.error("Error checking hacker status:", error);
      message.error("Failed to check hacker status. Please try again.");
    }
  };

  const styles = {
    display: {
      paddingBlock: "15px 0px"
    },
    statusText: {
      fontSize: "17px"
    },
    statusValue: {
      fontWeight: 800
    }
  } as const;

  const statusMapping = {
    isActivating: "🟡 Connecting",
    isActive: "🟢 Connected",
    notAdded: "🔴 Not Added",
    added: "🟢 Added",
    default: "⚪️ Disconnected"
  };

  let status = statusMapping.default;
  if (isActivating) {
    status = statusMapping.isActivating;
  } else if (isActive) {
    status = statusMapping.isActive;
  }

  return (
    <div style={styles.display}>
      <Typography>
        <Paragraph style={styles.statusText}>
          Wallet status: <span style={styles.statusValue}>{status}</span>
        </Paragraph>
        {isActive && (
          <Paragraph style={styles.statusText}>
            Account Added to Hackerone status: <span style={styles.statusValue}>{isHacker ? statusMapping.added : statusMapping.notAdded}</span>
          </Paragraph>
        )}
      </Typography>
    </div>
  );
};

export default Status;