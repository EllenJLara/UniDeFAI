import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClaimButton } from "./claim-reward-button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const mockData = [
  { date: "Dec 27", earnings: 0.0 },
  { date: "Dec 31", earnings: 0.0 },
  { date: "Jan 4", earnings: 0.0 },
  { date: "Jan 10", earnings: 0.0 },
  { date: "Jan 18", earnings: 0.0 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-lg">
        <p className="text-zinc-400 text-xs mb-1">{label}</p>
        <p className="text-zinc-100 text-sm font-medium">
          {payload[0].value.toFixed(3)} SOL
        </p>
      </div>
    );
  }
  return null;
};

const EarningsDashboard = ({ isOpen, onClose, userId }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-black/90 border-zinc-800 w-[85vw]">
        <DialogHeader className="mb-4 sm:mb-6 pl-6 relative">
          <DialogClose className="absolute left-0 top-0 rounded-sm opacity-70 ring-offset-black transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-zinc-800">
            <X className="h-4 w-4 text-zinc-400" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <DialogTitle className="text-xl sm:text-2xl font-medium text-zinc-100 text-center">
            Earnings Dashboard
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Balance Card */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-zinc-400">Available Balance</p>
                  <p className="text-2xl sm:text-3xl font-semibold text-zinc-100">
                    0.000 SOL
                  </p>
                </div>
                <ClaimButton userId={userId} variant="earnings-display" />
              </div>
            </CardContent>
          </Card>

          {/* Tabs Section */}
          <Tabs defaultValue="history" className="space-y-4 sm:space-y-6">
            <div className="sticky top-0 z-10 bg-black/90 pb-4 sm:pb-6">
              <TabsList className="grid w-full grid-cols-2 bg-zinc-900/50 p-1">
                <TabsTrigger
                  value="history"
                  className="text-sm sm:text-base data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100"
                >
                  Earning History
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="text-sm sm:text-base data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100"
                >
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="history" className="space-y-4 sm:space-y-6">
              {/* Chart Section */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-4 sm:p-6">
                  <div className="mb-4">
                    <h3 className="text-base sm:text-lg font-medium text-zinc-100">
                      Recent Earnings
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400">
                      Your earnings over the last 30 days
                    </p>
                  </div>
                  <div className="h-48 sm:h-64 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={mockData}
                        margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis
                          dataKey="date"
                          stroke="#666"
                          tick={{ fill: "#999", fontSize: 12 }}
                          tickMargin={10}
                        />
                        <YAxis
                          stroke="#666"
                          tick={{ fill: "#999", fontSize: 12 }}
                          tickFormatter={(value) => value.toFixed(2)}
                          tickMargin={10}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="earnings"
                          stroke="#22c55e"
                          strokeWidth={2}
                          dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: "#22c55e" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Transactions Table */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-4 sm:p-6">
                  <div className="mb-4">
                    <h3 className="text-base sm:text-lg font-medium text-zinc-100">
                      Transaction History
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400">
                      Your recent earning claims
                    </p>
                  </div>
                  {/* <div className="rounded-lg border border-zinc-800 overflow-hidden overflow-x-auto">
                    <div className="min-w-[480px]">
                      <div className="grid grid-cols-3 p-3 sm:p-4 bg-zinc-900/50">
                        <div className="text-xs sm:text-sm font-medium text-zinc-400">
                          Date
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-zinc-400">
                          Amount
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-zinc-400">
                          Status
                        </div>
                      </div>
                      <div className="divide-y divide-zinc-800">
                        {mockData.map((item, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-3 p-3 sm:p-4 hover:bg-zinc-900/30 transition-colors"
                          >
                            <div className="text-xs sm:text-sm text-zinc-300">
                              {item.date}
                            </div>
                            <div className="text-xs sm:text-sm text-zinc-300">
                              {item.earnings} SOL
                            </div>
                            <div className="text-xs sm:text-sm text-emerald-500">
                              Claimed
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div> */}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
              {/* Analytics Overview */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-4 sm:p-6">
                  <div className="mb-4">
                    <h3 className="text-base sm:text-lg font-medium text-zinc-100">
                      Analytics Overview
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400">
                      Detailed insights about your earnings
                    </p>
                  </div>
                  <div className="h-48 sm:h-64 flex items-center justify-center bg-zinc-900/30 rounded-lg">
                    <div className="text-center px-4">
                      <p className="text-base sm:text-lg text-zinc-400">
                        Analytics features coming soon 👀
                      </p>
                      <p className="text-xs sm:text-sm mt-2 text-zinc-500">
                        Track your earning patterns and insights
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Metrics */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-4 sm:p-6">
                  <div className="mb-4">
                    <h3 className="text-base sm:text-lg font-medium text-zinc-100">
                      Detailed Metrics
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400">
                      Advanced analytics and statistics
                    </p>
                  </div>
                  <div className="rounded-lg border border-zinc-800 overflow-hidden">
                    <div className="grid grid-cols-3 p-3 sm:p-4 bg-zinc-900/50">
                      <div className="text-xs sm:text-sm font-medium text-zinc-400">
                        Metric
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-zinc-400">
                        Value
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-zinc-400">
                        Change
                      </div>
                    </div>
                    <div className="flex items-center justify-center h-36 sm:h-48 text-zinc-500 text-xs sm:text-sm">
                      Coming soon...
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EarningsDashboard;
