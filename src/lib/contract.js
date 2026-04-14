import { client } from "./genlayer";

const CONTRACT_ADDRESS = "0x6C85a2cD4025796313486879Ee6734f144381D3f";

export async function submitScore(sessionId, playerName, score) {
  try {
    const res = await client.write({
      contract: CONTRACT_ADDRESS,
      method: "submit_score",
      args: [sessionId, playerName, score],
    });

    console.log("✅ Score submitted:", res);
  } catch (err) {
    console.error("❌ Submit score error:", err);
  }
}

export async function getLeaderboard() {
  try {
    const res = await client.read({
      contract: CONTRACT_ADDRESS,
      method: "get_leaderboard",
      args: [],
    });

    return res;
  } catch (err) {
    console.error("❌ Leaderboard error:", err);
    return [];
  }
}