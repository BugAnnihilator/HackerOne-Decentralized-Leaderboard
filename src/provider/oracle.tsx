// Import Axios library
import axios, { AxiosResponse } from "axios";
import { ethers } from "ethers";
import React, { useEffect } from 'react';

// Main function to get user thanks items and user stats
async function getUserData(username: string): Promise<{
    avatarUrl: string | null;
    reputation: number | null;
    totalReportCount: number;
    impact: number;
    username: string;
}> {
    const collectedNodes: any[] = []; // To store all nodes across multiple requests
    let hasNextPage = true; // Pagination control
    let cursor: string | null = null; // Cursor to handle pagination
    let totalReportCount = 0; // To accumulate total_report_count

    const headers = {
        "Content-Type": "application/json",
        "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "X-Product-Feature": "other",
        Accept: "*/*",
    };

    const thanksQuery = `query UserProfileThanks($username: String!, $cursor: String, $pageSize: Int!) {
        user(username: $username) {
            id
            user_display_options {
                show_private_team_thanks
                __typename
            }
            username
            thanks_items(first: $pageSize, after: $cursor) {
                total_count
                pageInfo {
                    hasNextPage
                    endCursor
                    __typename
                }
                edges {
                    node {
                        id
                        rank
                        report_count
                        total_report_count
                        reputation
                        team {
                            id
                            handle
                            name
                            state
                            url
                            profile_picture(size: medium)
                            __typename
                        }
                        __typename
                    }
                    __typename
                }
                __typename
            }
            __typename
        }
    }`;

    // Loop to paginate until there's no more pages
    while (hasNextPage) {
        const requestBody = {
            operationName: "UserProfileThanks",
            variables: {
                username,
                cursor,
                pageSize: 100, // Set a reasonable page size
            },
            query: thanksQuery,
        };

        try {
            // Send the POST request to the GraphQL API

            const response = await axios.post(
                "https://hackerone.com/graphql",
                requestBody,
                { headers, http2: true },
            );

            const responseData = response.data;
            const userData = responseData.data.user;

            if (userData && userData.thanks_items) {
                const thanksItems = userData.thanks_items;

                // Collect all nodes from the current response
                const nodes = thanksItems.edges.map((edge: any) => edge.node);
                collectedNodes.push(...nodes);

                // Accumulate total_report_count and reputation
                nodes.forEach((node: any) => {
                    totalReportCount += node.total_report_count || 0; // Handle cases where total_report_count is null
                });

                // Update pagination data
                hasNextPage = thanksItems.pageInfo.hasNextPage;
                cursor = thanksItems.pageInfo.endCursor;
            } else {
                hasNextPage = false; // Stop pagination if no valid data is returned
            }
        } catch (error) {
            console.error("Error occurred while fetching data:", (error as Error).message);
            hasNextPage = false; // Stop if there's an error
        }
    }

    // After collecting the thanks data, make another request for user stats
    const statsQuery = `query UserProfileStatsCard($username: String!) {
        user(username: $username) {
            id
            signal
            signal_percentile
            impact
            impact_percentile
            reputation
            rank
            __typename
        }
    }`;

    const statsRequestBody = {
        operationName: "UserProfileStatsCard",
        variables: {
            username,
        },
        query: statsQuery,
    };

    let impact: number | null = null;
    let reputation: number | null = null;

    try {
        // Send the second POST request to get the user's stats
        const statsResponse = await axios.post(
            "https://hackerone.com/graphql",
            statsRequestBody,
            { headers, http2: true },
        );

        const statsData = statsResponse.data.data.user;

        if (statsData) {
            // Assign values to the variables defined outside
            impact = statsData.impact;
            reputation = statsData.reputation;
        }
    } catch (error) {
        console.error(
            "Error occurred while fetching user stats:",
            (error as Error).message,
        );
    }

    const avatarUrlQuery = `query UserProfilePage($resourceIdentifier: String!) {
  user(username: $resourceIdentifier) {
    profile_picture(size: large)
    __typename
  }
}
`;

    const avatarUrlRequestBody = {
        operationName: "UserProfilePage",
        variables: {
            resourceIdentifier: username,
        },
        query: avatarUrlQuery,
    };

    let avatarUrl: string | null = null;

    try {
        // Send the third POST request to get the user's avatar

        const avatarResponse: AxiosResponse<any> = await axios.post(
            "https://hackerone.com/graphql",
            avatarUrlRequestBody,
            { headers, http2: true },
        );

        if (avatarResponse) {
            // Assign values to the variables defined outside
            avatarUrl = avatarResponse.data.data.user.profile_picture;
        }
    } catch (error) {
        console.error(
            "Error occurred while fetching user avatarResponse:",
            (error as Error).message,
        );
    }

    return {
        avatarUrl,
        reputation,
        totalReportCount,
        impact: impact !== null ? Math.round(impact) : 0,
        username,
    }; // Return all collected node data and the sums
}

async function main() {
    // Initialize provider
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

    // Initialize signer using the account wallet from the app
    const signer = provider.getSigner();

    // Initialize contract
    const oracleContractAddress = "0xD15Cef96b533e9a24b02F9cD94cD98e6F9c2634E";
    const oracleContractABI = require("./HackerOneOracle.json");
    const oracleContract = new ethers.Contract(
        oracleContractAddress,
        oracleContractABI,
        signer
    );

    // Populate requests queue
    const requestsQueue: { callerAddress: string; id: string; username: string }[] = [];

    oracleContract.on("DataFetchRequested", async (callerAddress: string, id: string, username: string) => {
        requestsQueue.push({ callerAddress, id, username });
    });

    // Poll and process requests queue at intervals
    const processRequests = async () => {
        const BATCH_SIZE = 5; // Process up to 5 requests at a time
        const MAX_RETRIES = 3; // Maximum number of retries for each request

        let processedRequests = 0;

        while (requestsQueue.length > 0 && processedRequests < BATCH_SIZE) {
            const request = requestsQueue.shift();

            if (request) {
                let retries = 0;
                while (retries < MAX_RETRIES) {
                    try {
                        const {
                            avatarUrl,
                            reputation,
                            totalReportCount,
                            impact,
                            username,
                        } = await getUserData(request.username);

                        await oracleContract.returnHackerData(
                            avatarUrl,
                            reputation,
                            totalReportCount,
                            impact,
                            username,
                            request.callerAddress,
                            request.id
                        );
                        break;
                    } catch (error) {
                        console.error(`Error processing request: ${(error as Error).message}`);
                        retries++;
                        if (retries === MAX_RETRIES) {
                            console.error(`Max retries reached for request ${request.id}`);
                        }
                    }
                }

                processedRequests++;
            }
        }

        // Schedule the next batch of requests
        setTimeout(processRequests, 5000); // Wait for 5 seconds before processing the next batch
    };

    // Start processing requests
    processRequests();
}

// Wrap the existing code in a React component
const OracleComponent: React.FC = () => {        console.log("OracleComponent mounted");

    useEffect(() => {
        main();
        console.log("OracleComponent mounted");
    }, []);

    return null; // This component doesn't render anything
};

export default OracleComponent;