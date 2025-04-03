import { useState, useEffect } from "react";
import { Transactions } from "@/types/database";
import { DataCard } from "@/components/ui/DataCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search, Calendar, Clock, CheckCircle, AlertCircle, Filter, Edit } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { updateData, removeData } from "@/lib/firebase";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format, parse } from "date-fns";

interface TransactionsPanelProps {
  transactions: Transactions;
  usedOrderIds: { [key: string]: boolean };
  onDeleteTransaction?: (transactionId: string) => Promise<void>;
}

interface ProcessedTransaction {
  id: string;
  type: string;
  approved: string;
  slot?: string;
  startTime?: string;
  endTime?: string;
  originalData: any;
}

export function TransactionsPanel({ transactions, usedOrderIds, onDeleteTransaction }: TransactionsPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [editingTransaction, setEditingTransaction] = useState<ProcessedTransaction | null>(null);
  const [editedData, setEditedData] = useState<any>(null);
  const [localTransactions, setLocalTransactions] = useState<Transactions>({...transactions});
  const [localUsedOrderIds, setLocalUsedOrderIds] = useState<{[key: string]: boolean}>({...usedOrderIds});
  const [deleteConfirmation, setDeleteConfirmation] = useState<{open: boolean; id: string; type: string}>({
    open: false,
    id: "",
    type: ""
  });
  const [deleteOrderIdConfirmation, setDeleteOrderIdConfirmation] = useState<{open: boolean; orderId: string}>({
    open: false,
    orderId: ""
  });
  
  // Update local state when props change
  useEffect(() => {
    setLocalTransactions({...transactions});
    setLocalUsedOrderIds({...usedOrderIds});
  }, [transactions, usedOrderIds]);
  
  const processTransactions = (): ProcessedTransaction[] => {
    const processedTransactions: ProcessedTransaction[] = [];
    
    const regularTransactions: Record<string, any> = {};
    const specialTransactions: Record<string, Record<string, any>> = {};
    
    Object.entries(localTransactions).forEach(([key, value]) => {
      if (key === "FTRIAL-ID" || key === "REF-ID") {
        specialTransactions[key] = value as Record<string, any>;
      } else {
        regularTransactions[key] = value;
      }
    });
    
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
          endTime: transaction.end_time,
          originalData: transaction
        });
      }
    });
    
    Object.entries(specialTransactions).forEach(([type, transactions]) => {
      Object.entries(transactions).forEach(([transactionId, details]) => {
        if (
          (transactionId !== type + "-OTTONRENT") && 
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
            endTime: transaction.end_time,
            originalData: transaction
          });
        }
      });
    });
    
    return processedTransactions.sort((a, b) => 
      new Date(b.approved).getTime() - new Date(a.approved).getTime()
    );
  };

  const processedTransactions = processTransactions();

  const handleEditTransaction = (transaction: ProcessedTransaction) => {
    setEditingTransaction(transaction);
    setEditedData({...transaction.originalData});
  };

  const handleSaveTransaction = async () => {
    if (!editingTransaction || !editedData) return;
    
    const path = editingTransaction.type === "Regular" 
      ? `/${editingTransaction.id}` 
      : `/${editingTransaction.type === "Free Trial" ? "FTRIAL-ID" : "REF-ID"}/${editingTransaction.id}`;
    
    try {
      await updateData(path, editedData);
      
      // Update local state
      if (editingTransaction.type === "Regular") {
        setLocalTransactions(prev => ({
          ...prev,
          [editingTransaction.id]: editedData
        }));
      } else {
        const typeKey = editingTransaction.type === "Free Trial" ? "FTRIAL-ID" : "REF-ID";
        setLocalTransactions(prev => ({
          ...prev,
          [typeKey]: {
            ...prev[typeKey],
            [editingTransaction.id]: editedData
          }
        }));
      }
      
      toast.success("Transaction updated successfully");
      setEditingTransaction(null);
      setEditedData(null);
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Failed to update transaction");
    }
  };

  const handleDeleteTransaction = async (id: string, type: string) => {
    const path = type === "Regular" 
      ? `/${id}` 
      : `/${type === "Free Trial" ? "FTRIAL-ID" : "REF-ID"}/${id}`;
    
    try {
      await removeData(path);
      
      // Update local state
      if (type === "Regular") {
        const updatedTransactions = { ...localTransactions };
        delete updatedTransactions[id];
        setLocalTransactions(updatedTransactions);
      } else {
        const typeKey = type === "Free Trial" ? "FTRIAL-ID" : "REF-ID";
        const updatedTransactions = { ...localTransactions };
        if (updatedTransactions[typeKey]) {
          const updatedType = { ...updatedTransactions[typeKey] };
          delete updatedType[id];
          updatedTransactions[typeKey] = updatedType;
          setLocalTransactions(updatedTransactions);
        }
      }
      
      toast.success("Transaction deleted successfully");
      setDeleteConfirmation({open: false, id: "", type: ""});
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    }
  };

  const handleDeleteOrderId = async (orderId: string) => {
    try {
      await removeData(`/used_orderids/${orderId}`);
      
      // Update local state
      const updatedOrderIds = { ...localUsedOrderIds };
      delete updatedOrderIds[orderId];
      setLocalUsedOrderIds(updatedOrderIds);
      
      toast.success("Order ID deleted successfully");
      setDeleteOrderIdConfirmation({open: false, orderId: ""});
    } catch (error) {
      console.error("Error deleting Order ID:", error);
      toast.error("Failed to delete Order ID");
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (!editedData) return;
    
    setEditedData({
      ...editedData,
      [field]: value
    });
  };

  const formatDateTime = (dateString: string): string => {
    try {
      return format(new Date(dateString), "PPP p");
    } catch (e) {
      return dateString;
    }
  };

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
            <SelectContent className="bg-background">
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
            <span className="text-3xl font-bold">
              {Object.keys(localTransactions).filter(key => key !== "FTRIAL-ID" && key !== "REF-ID").length}
            </span>
            <p className="text-muted-foreground text-sm mt-1">Regular transactions</p>
          </div>
        </DataCard>
        
        <DataCard title="Free Trials" className="text-center">
          <div className="py-4">
            <span className="text-3xl font-bold">
              {localTransactions["FTRIAL-ID"] && 
               Object.keys(localTransactions["FTRIAL-ID"]).filter(id => id !== "FTRIAL-ID-OTTONRENT").length}
            </span>
            <p className="text-muted-foreground text-sm mt-1">Total claimed</p>
          </div>
        </DataCard>
        
        <DataCard title="Referral Redemptions" className="text-center">
          <div className="py-4">
            <span className="text-3xl font-bold">
              {localTransactions["REF-ID"] ? 
               Object.keys(localTransactions["REF-ID"]).filter(key => key !== "REF-ID-OTTONRENT").length : 
               0}
            </span>
            <p className="text-muted-foreground text-sm mt-1">Point redemptions</p>
          </div>
        </DataCard>
      </div>
      
      <div className="glass-morphism rounded-lg overflow-hidden">
        {processedTransactions.length > 0 ? (
          <div className="overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Time Period</TableHead>
                  <TableHead>Approval Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                              {format(new Date(transaction.startTime), "h:mm a")} - 
                              {format(new Date(transaction.endTime), "h:mm a")}
                            </span>
                          </div>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {transaction.approved !== "Unknown" ? 
                        format(new Date(transaction.approved), "PPP p") : 
                        "Unknown"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditTransaction(transaction)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setDeleteConfirmation({
                            open: true, 
                            id: transaction.id,
                            type: transaction.type
                          })}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
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
          <div className="overflow-auto p-4" style={{ maxHeight: '200px' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {Object.entries(localUsedOrderIds).map(([orderId, used]) => (
                <div key={orderId} className="flex items-center justify-between p-2 rounded-md bg-white/5">
                  <span className="text-sm truncate mr-2">{orderId}</span>
                  <div className="flex gap-1">
                    {used ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-400" />
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                      onClick={() => setDeleteOrderIdConfirmation({
                        open: true,
                        orderId
                      })}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {editingTransaction && editedData && (
        <Dialog open={!!editingTransaction} onOpenChange={(open) => {
          if (!open) {
            setEditingTransaction(null);
            setEditedData(null);
          }
        }}>
          <DialogContent className="bg-background">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
              <DialogDescription>
                Update the details for transaction ID: {editingTransaction.id}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="slot-id">Slot ID</Label>
                <Input
                  id="slot-id"
                  value={editedData.slot_id || ""}
                  onChange={(e) => handleInputChange('slot_id', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    value={editedData.start_time || ""}
                    onChange={(e) => handleInputChange('start_time', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    value={editedData.end_time || ""}
                    onChange={(e) => handleInputChange('end_time', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="approved-at">Approval Time</Label>
                <Input
                  id="approved-at"
                  value={editedData.approved_at || ""}
                  onChange={(e) => handleInputChange('approved_at', e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setEditingTransaction(null);
                setEditedData(null);
              }}>
                Cancel
              </Button>
              <Button onClick={handleSaveTransaction}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      <AlertDialog 
        open={deleteConfirmation.open} 
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirmation({...deleteConfirmation, open: false});
          }
        }}
      >
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the transaction ID: {deleteConfirmation.id}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => handleDeleteTransaction(deleteConfirmation.id, deleteConfirmation.type)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog 
        open={deleteOrderIdConfirmation.open} 
        onOpenChange={(open) => {
          if (!open) {
            setDeleteOrderIdConfirmation({...deleteOrderIdConfirmation, open: false});
          }
        }}
      >
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order ID?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the Order ID: {deleteOrderIdConfirmation.orderId}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => handleDeleteOrderId(deleteOrderIdConfirmation.orderId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
