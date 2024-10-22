import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { ethers } from 'ethers';
import { useWeb3React } from "@web3-react/core";
import contractABI from "../../data/abi/Hackerone.json";
import { HACKERONE_CONTRACT_ADDRESS } from "../../data/constants/contract_address";

type LeaderboardEntry = {
  rank: number;
  username: string;
  avatarUrl: string;
  reputation: number;
  reports: number;
  impact: number;
};

const columns = [
  {
    title: 'Rank',
    dataIndex: 'rank',
    key: 'rank',
  },
  {
    title: '',
    dataIndex: 'avatarUrl',
    key: 'avatar',
    render: (avatarUrl: string) => (
      <img
        src={avatarUrl}
        alt="avatar"
        style={{ width: 40, height: 40, borderRadius: '50%' }}
      />
    ),
  },
  {
    title: 'Username',
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: 'Reputation',
    dataIndex: 'reputation',
    key: 'reputation',
  },
  {
    title: 'Reports',
    dataIndex: 'reports',
    key: 'sigreportsnal',
  },
  {
    title: 'Impact',
    dataIndex: 'impact',
    key: 'impact',
  },
];

const HackerOneLeaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const { provider } = useWeb3React();

  useEffect(() => {
    const fetchHackerArray = async () => {
      if (!provider) {
        console.error("Provider is not available");
        return;
      }

      try {
        const signer = provider.getSigner();
        const contract = new ethers.Contract(HACKERONE_CONTRACT_ADDRESS, contractABI, signer);
        const hackersCount = await contract.getHackersCount();
        const hackerArray = [];
        
        // Loop through each hacker based on the count
        for (let i = 0; i < hackersCount; i++) {
          const hacker = await contract.Hackers(i); // Assuming Hackers(i) returns each hacker's data as an array
          hackerArray.push(hacker);
        }

        console.log("All Hackers:", hackerArray);

        // Map the hacker array data and parse BigNumber values
        const formattedData = hackerArray.map((hacker: any, index: number) => ({
          username: hacker[0], // string
          reputation: hacker[1].toNumber(), // BigNumber
          reports: hacker[2].toNumber(), // BigNumber
          wltAddress: hacker[3], // address
          avatarUrl: hacker[4], // string
          impact: hacker[5].toNumber(), // BigNumber
          rank: index + 1,
        }));

        // Sort the data based on reputation in descending order
        formattedData.sort((a, b) => b.reputation - a.reputation);

        // Update ranks after sorting
        const rankedData = formattedData.map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));

        setLeaderboardData(rankedData);
      } catch (error) {
        console.error("Error fetching hacker array:", error);
      }
    };

    fetchHackerArray();
  }, [provider]);

  return (
    <>
      <h1 style={{ color: 'white' }}> Hackerone Leaderboard </h1>
      <Table columns={columns} dataSource={leaderboardData} pagination={false} rowKey="rank" />
    </>
  );
};

export default HackerOneLeaderboard;
