import type { Web3ReactHooks } from "@web3-react/core";
import { Typography, message } from "antd";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

const { Paragraph } = Typography;

const Status = ({
  isActivating,
  isActive,
  account,
  hackeroneContract,
}: {
  isActivating: ReturnType<Web3ReactHooks["useIsActivating"]>;
  isActive: ReturnType<Web3ReactHooks["useIsActive"]>;
  account: string | undefined;
  hackeroneContract: ethers.Contract | null;
}) => {
  const [isHacker, setIsHacker] = useState<boolean | null>(null);

  useEffect(() => {
    if (isActive && account && hackeroneContract) {
      checkHackerStatus(account);
    }
  }, [isActive, account, hackeroneContract]);

  const checkHackerStatus = async (address: string) => {
    try {
      const [result] = await hackeroneContract?.checkHackerExists(address);
      setIsHacker(result);
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
            Account Added to Hackerone : <span style={styles.statusValue}>{isHacker ? statusMapping.added : statusMapping.notAdded}</span>
          </Paragraph>
        )}
      </Typography>
    </div>
  );
};

export default Status;