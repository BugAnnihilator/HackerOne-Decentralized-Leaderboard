import React from 'react';
import { Table } from 'antd';

type LeaderboardEntry = {
  rank: number;
  username: string;
  avatarUrl: string;
  reputation: number;
  signal: number;
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
    title: 'Signal',
    dataIndex: 'signal',
    key: 'signal',
  },
  {
    title: 'Impact',
    dataIndex: 'impact',
    key: 'impact',
  },
];

// Mock data - replace this with actual data fetching logic
const mockData: LeaderboardEntry[] = [
  { rank: 1, username: 'todayisnew', avatarUrl: 'https://example.com/avatar1.png', reputation: 204140, signal: 5.90, impact: 16.43 },
  { rank: 2, username: 'd0xing', avatarUrl: 'https://example.com/avatar2.png', reputation: 136439, signal: 6.90, impact: 18.62 },
  { rank: 3, username: 'try_to_hack', avatarUrl: 'https://example.com/avatar3.png', reputation: 105299, signal: 5.98, impact: 16.08 },
  { rank: 4, username: 'm0Chan', avatarUrl: 'https://example.com/avatar4.png', reputation: 81329, signal: 6.78, impact: 16.62 },
  { rank: 5, username: 'godiego', avatarUrl: 'https://example.com/avatar5.png', reputation: 51232, signal: 6.92, impact: 19.07 },
  { rank: 6, username: 'nagli', avatarUrl: 'https://example.com/avatar6.png', reputation: 44729, signal: 6.81, impact: 19.46 },
  { rank: 7, username: 'sergeym', avatarUrl: 'https://example.com/avatar7.png', reputation: 41129, signal: 5.35, impact: 15.51 },
  { rank: 8, username: 'fransrosen', avatarUrl: 'https://example.com/avatar8.png', reputation: 37854, signal: 6.71, impact: 25.56 },
  { rank: 9, username: '0xd0m7', avatarUrl: 'https://example.com/avatar9.png', reputation: 36496, signal: 6.05, impact: 21.63 },
  { rank: 10, username: 'inhibitor181', avatarUrl: 'https://example.com/avatar10.png', reputation: 36077, signal: 6.53, impact: 27.04 },
  { rank: 11, username: 'jayesh25', avatarUrl: 'https://example.com/avatar11.png', reputation: 34447, signal: 6.86, impact: 21.85 },
  { rank: 12, username: 'rz01', avatarUrl: 'https://example.com/avatar12.png', reputation: 32030, signal: 6.25, impact: 23.27 },
];

const HackerOneLeaderboard: React.FC = () => {
  return (
   <> <h1 style={{ color: 'white' }}> Hackerone Learderboard </h1>
    <Table columns={columns} dataSource={mockData} pagination={false} rowKey="rank" />
    </>
  );
};

export default HackerOneLeaderboard;
