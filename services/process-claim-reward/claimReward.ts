import axios from "axios";

import { Claim, Ledger, User } from "@prisma/client";

export interface IClaim extends Claim {
  user: User;
}

export interface ILedger extends Ledger {
  user: User;
}

export interface IClaimResponse {
  claim: IClaim;
  newLedger: ILedger;
}

export const claimReward = async (
  userId: string
): Promise<IClaimResponse | { error: string }> => {
  try {
    const response = await axios.post<IClaimResponse>(
      "/api/trading-fees-reward/claim",
      {
        userId,
      }
    );

    return response.data;
  } catch (error) {
    let errorMessage = "Failed to claim rewards";

    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error || errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Log detailed error for debugging purposes
    console.error("Claim reward error:", {
      message: errorMessage,
      details: error,
    });

    // Return an error object so the client can display it
    return { error: errorMessage };
  }
};
