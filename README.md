# Welcome Guys!

Welcome, everyone! This is my first web3 app. As a bug bounty hunter and developer, I have ventured into the web3 space. After gaining a good understanding of some key concepts, I built my first hybrid smart contract and this app. I want to thank the boilerplate for providing the template!

**Note**: This project is more about the smart contracts I developed than the UI/UX design.

### Smart Contracts on Holesky Testnet


The app is now live and can be accessed at https://bugannihilator.github.io/HackerOne-Decentralized-Leaderboard/ 

The smart contracts are deployed on the **Holesky testnet chain**. You can get free faucets from the following link:
[Google Cloud Ethereum Faucet for Holesky](https://cloud.google.com/application/web3/faucet/ethereum/holesky)

Here are the deployed contract addresses:

- **HackerOneCaller.sol**: `0xFD687D9072499C5f066Eb09516ed5598d99e1c8D`
- **HackerOneOracle.sol**: `0x1e431c8c63080F9BA82cC214C2eee6bF2a2931Cd`

### Key Highlights

The core functionality of this application revolves around two smart contracts: a **caller contract** and an **oracle contract**.

1. **Caller Contract**: The user interacts with the caller contract to trigger a request for hacker data.
   
2. **Oracle Contract**: Upon receiving the request, the caller contract communicates with the oracle contract, which gathers the necessary data from external data providers.

3. **Data Fetch and Update**: The oracle contract fetches the hacker data and sends it back to the caller contract. The caller contract processes the data, updates the hacker information, and sorts it to maintain a dynamic leaderboard.



### Smart Contracts Location

The smart contracts are located in the following path:

[https://github.com/BugAnnihilator/HackerOne-Decentralized-Leaderboard/tree/main/src/Smart_Contracts](https://github.com/BugAnnihilator/HackerOne-Decentralized-Leaderboard/tree/main/src/Smart_Contracts)

Feel free to explore the contract code to see the implementation details of this Web3 application!

---

### Special Thanks
A big shoutout to the **boilerplate** that provided the foundational template for this project. It made the development process smoother and allowed me to focus on learning and implementing smart contracts.

---

### What's Next?

I'm excited to keep learning and improving, both in Web3 development and bug bounty hunting. Thanks for checking out my first Web3 project!

---

**Author**: Fahad Faisal (a.k.a. cametome006)

