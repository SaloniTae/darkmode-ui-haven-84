
import { useState } from "react";
import { Transactions } from "@/types/database";
import { DataCard } from "@/components/ui/DataCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TransactionsPanelProps {
  transactions: Transactions;
  usedOrderIds: { [key: string]: boolean };
}

export function TransactionsPanel({ transactions, usedOrderIds }: TransactionsPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  
  // Separate transaction types
  const regularTransactions: Record<string, any> = {};
  const specialTransactions: Record<string, Record<string, any>> = {};
  
  Object.entries(transactions).forEach(([key, value]) => {
    if (key === "FTRIAL-ID" || key === "REF-ID") {
      specialTransactions[key] = value as Record<string, any>;
    } else {
      regularTransactions[key] = value;
    }
  });
  
  // Filter and process transactions for display
  const processedTransactions: Array<{
    id: string;
    type: string;
    approved: string;
    slot?: string;
    startTime?: string;
    endTime?: string;
  }> = [];
  
  // Process regular transactions
  Object.entries(regularTransactions).forEach(([transactionId, details]) => {
    if (
      (filterType === "all" || filterType === "regular") &&
      (transactionId.toLowerCase().includes(searchTerm.toLowerCase()))
    ) {
      const transaction = details as any;
      processedTransactions.push({
        id: transactionId,
        type: "Regular",
        approved: transaction.approved_at || "Unknown",
        slot: transaction.slot_id,
        startTime: transaction.start_time,
        endTime: transaction.end_time
      });
    }
  });
  
  // Process special transactions (free trials and referrals)
  Object.entries(specialTransactions).forEach(([type, transactions]) => {
    Object.entries(transactions).forEach(([transactionId, details]) => {
      if (
        (transactionId !== type + "-OTTONRENT") && // Skip counter entries
        (filterType === "all" || 
         (filterType === "freetrial" && type === "FTRIAL-ID") ||
         (filterType === "referral" && type === "REF-ID")) &&
        (transactionId.toLowerCase().includes(searchTerm.toLowerCase()))
      ) {
        const transaction = details as any;
        processedTransactions.push({
          id: transactionId,
          type: type === "FTRIAL-ID" ? "Free Trial" : "Referral",
          approved: transaction.approved_at || "Unknown",
          slot: transaction.slot_id,
          startTime: transaction.start_time,
          endTime: transaction.end_time
        });
      }
    });
  });
  
  // Sort transactions by approval date (newest first)
  processedTransactions.sort((a, b) => 
    new Date(b.approved).getTime() - new Date(a.approved).getTime()
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <h2 className="text-2xl font-bold">Transactions</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="freetrial">Free Trial</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DataCard title="Total Transactions" className="text-center">
          <div className="py-4">
            <span className="text-3xl font-bold">{Object.keys(regularTransactions).length}</span>
            <p className="text-muted-foreground text-sm mt-1">Regular transactions</p>
          </div>
        </DataCard>
        
        <DataCard title="Free Trials" className="text-center">
          <div className="py-4">
            <span className="text-3xl font-bold">
              {specialTransactions["FTRIAL-ID"] ? 
                (specialTransactions["FTRIAL-ID"]["FTRIAL-OTTONRENT"] as number || 0) : 
                0}
            </span>
            <p className="text-muted-foreground text-sm mt-1">Total claimed</p>
          </div>
        </DataCard>
        
        <DataCard title="Referral Redemptions" className="text-center">
          <div className="py-4">
            <span className="text-3xl font-bold">
              {Object.keys(specialTransactions["REF-ID"] || {}).length - 1}
            </span>
            <p className="text-muted-foreground text-sm mt-1">Point redemptions</p>
          </div>
        </DataCard>
      </div>
      
      <div className="glass-morphism rounded-lg overflow-hidden">
        {processedTransactions.length > 0 ? (
          <div className="max-h-[500px] overflow-y-auto scrollbar-none">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Time Period</TableHead>
                  <TableHead className="text-right">Approval Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.id}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.type === "Regular" ? "bg-blue-500/20 text-blue-400" :
                        transaction.type === "Free Trial" ? "bg-purple-500/20 text-purple-400" : 
                                                           "bg-green-500/20 text-green-400"
                      }`}>
                        {transaction.type}
                      </span>
                    </TableCell>
                    <TableCell>{transaction.slot || "N/A"}</TableCell>
                    <TableCell>
                      {transaction.startTime && transaction.endTime ? (
                        <div className="text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(transaction.startTime).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(transaction.startTime).toLocaleTimeString()} - 
                              {new Date(transaction.endTime).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {transaction.approved !== "Unknown" ? new Date(transaction.approved).toLocaleString() : "Unknown"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState 
            title="No transactions found"
            description="Try adjusting your search or filter settings."
            icon={<Search className="h-10 w-10" />}
          />
        )}
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Used Order IDs</h3>
        <div className="glass-morphism rounded-lg overflow-hidden">
          <div className="p-4 max-h-[300px] overflow-y-auto scrollbar-none">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {Object.entries(usedOrderIds).map(([orderId, used]) => (
                <div key={orderId} className="flex items-center justify-between p-2 rounded-md bg-white/5">
                  <span className="text-sm truncate mr-2">{orderId}</span>
                  {used ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
