import { NextResponse } from "next/server";
import Airtable from "airtable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email && !session?.user?.walletAddress) {
      return NextResponse.json({ approved: false });
    }

    const { walletAddress, email } = session.user;
    console.log(session);
    let filterFormula = '';
    let isApproved = false;

    if (walletAddress) {
      filterFormula = `{wallet_address} = "${walletAddress}"`;
      const walletRecords = await base('Early_Access_Program')
        .select({
          filterByFormula: filterFormula,
        })
        .firstPage();
      if (walletRecords.length > 0) {
        isApproved = walletRecords[0].fields.approved === "True"; 
      }
    }

    if (!isApproved && email) {
      filterFormula = `{email} = "${email}"`;
      const emailRecords = await base('Early_Access_Program')
        .select({
          filterByFormula: filterFormula,
        })
        .firstPage();

      if (emailRecords.length > 0) {
        isApproved = emailRecords[0].fields.approved === "True";
      }
    }
    console.log("Approved:", isApproved);
    return NextResponse.json({ approved: isApproved });
  } catch (error) {
    console.error("Error checking approval:", error);
    return NextResponse.json({ approved: false });
  }
}
