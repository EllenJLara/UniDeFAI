import { PublicKey } from "@solana/web3.js";

export const fetchQuote = async (
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps: number = 50,
  platformFeeBps: number = 100,
): Promise<any> => {
  console.log("Fetching quote for inputMint:", inputMint, "outputMint:", outputMint, "amount:", amount, "slippageBps:", slippageBps, "platformFeeBps:", platformFeeBps);
  try {
    const url = new URL("https://quote-api.jup.ag/v6/quote");
    url.searchParams.append("inputMint", inputMint);
    url.searchParams.append("outputMint", outputMint);
    url.searchParams.append("amount", amount?.toString());
    url.searchParams.append("slippageBps", slippageBps?.toString());
    url.searchParams.append("platformFeeBps", platformFeeBps?.toString());
    url.searchParams.append("restrictIntermediateTokens", "true");

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error("Fetch quote failed with status:", response.status);
      console.error("Response body:", await response.text()); // Log the response text

      throw new Error(`Failed to fetch quote: ${response.statusText}`);
    }
    const quoteResponse = await response.json();
    console.log("Fetch quote succeeded. Response:", quoteResponse); // Log the successful response
    return quoteResponse;
  } catch (error) {
    console.error("Error fetching quote:", error);
    throw error;
  }
};

export const fetchSwapTransaction = async (
  referralAccountPubkey: PublicKey,
  mint: PublicKey,
  quoteResponse: any,
  wallet: any
): Promise<any> => {
  try {
    const [feeAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("referral_ata"),
        referralAccountPubkey.toBuffer(),
        mint.toBuffer(),
      ],
      new PublicKey("REFER4ZgmyYx9c6He5XfaTMiGfdLwRnkV4RPp9t9iF3")
    );

    const requestBody = {
      quoteResponse,
      userPublicKey: wallet.address,
      wrapAndUnwrapSol: true,
      feeAccount,
      dynamicComputeUnitLimit: true, // Set this to true to get the best optimized CU usage.
      dynamicSlippage: {
        // This will set an optimized slippage to ensure high success rate
        maxBps: 300, // Make sure to set a reasonable cap here to prevent MEV
      },
      prioritizationFeeLamports: "auto",
    };

    const response = await fetch("https://quote-api.jup.ag/v6/swap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    console.log(requestBody);
    if (!response.ok) {
      console.error("Fetch transaction failed with status:", response.status);
      console.error("Response body:", await response.text()); // Log the response text

      throw new Error("Failed to fetch swap transaction.");
    }

    const { swapTransaction } = await response.json();
    return swapTransaction; // Return serialized transaction
  } catch (error: any) {
    console.error("Failed to fetch swap transaction:", error);
    throw error;
  }
};
