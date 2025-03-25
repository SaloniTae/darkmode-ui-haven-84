
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DataCard } from "@/components/ui/DataCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Database, FileJson, FolderOpen, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for demonstration
const mockCollections = [
  { id: "users", count: 124, lastUpdated: "2h ago" },
  { id: "products", count: 45, lastUpdated: "1d ago" },
  { id: "orders", count: 89, lastUpdated: "5h ago" },
  { id: "reviews", count: 36, lastUpdated: "3d ago" },
];

const DatabasePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("collections");

  const filteredCollections = searchQuery 
    ? mockCollections.filter(col => col.id.toLowerCase().includes(searchQuery.toLowerCase()))
    : mockCollections;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto animate-fade-in">
        <section className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-block p-2 px-3 bg-primary/10 rounded-full mb-2">
                <div className="flex items-center gap-2 text-sm">
                  <Database className="h-4 w-4" />
                  <span>Database Explorer</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold">Firebase Schema</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search collections..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                New Collection
              </Button>
            </div>
          </div>

          <Tabs defaultValue="collections" onValueChange={setActiveTab} className="w-full">
            <TabsList className="glass-morphism mb-6">
              <TabsTrigger value="collections">
                <FolderOpen className="h-4 w-4 mr-2" />
                Collections
              </TabsTrigger>
              <TabsTrigger value="schema">
                <FileJson className="h-4 w-4 mr-2" />
                Schema
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="collections" className="animate-fade-in">
              {filteredCollections.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCollections.map((collection) => (
                    <DataCard
                      key={collection.id}
                      title={collection.id}
                      cardClassName="hover:border-primary/30 transition-colors"
                      onClick={() => console.log(`Opening collection: ${collection.id}`)}
                      footer={
                        <div className="flex justify-between w-full text-sm text-muted-foreground">
                          <span>{collection.count} documents</span>
                          <span>Updated {collection.lastUpdated}</span>
                        </div>
                      }
                    >
                      <div className="flex items-center gap-3 py-2">
                        <div className="p-2 rounded-md bg-primary/10">
                          <FolderOpen className="h-5 w-5" />
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Firebase Collection
                        </div>
                      </div>
                    </DataCard>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No collections found"
                  description={searchQuery ? `No collections match "${searchQuery}"` : "You don't have any collections yet"}
                  icon={<FolderOpen className="h-12 w-12" />}
                  action={
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Collection
                    </Button>
                  }
                />
              )}
            </TabsContent>
            
            <TabsContent value="schema" className="animate-fade-in">
              <DataCard
                title="Database Schema"
                cardClassName="w-full"
              >
                <div className="p-4 bg-black/20 rounded-md overflow-auto">
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
{`{
  "users": {
    "$uid": {
      "email": "string",
      "displayName": "string",
      "photoURL": "string",
      "createdAt": "timestamp",
      "lastLogin": "timestamp"
    }
  },
  "products": {
    "$productId": {
      "name": "string",
      "description": "string",
      "price": "number",
      "imageURL": "string",
      "category": "string",
      "createdAt": "timestamp"
    }
  },
  "orders": {
    "$orderId": {
      "userId": "string",
      "products": [
        {
          "productId": "string",
          "quantity": "number",
          "price": "number"
        }
      ],
      "totalAmount": "number",
      "status": "string",
      "createdAt": "timestamp"
    }
  },
  "reviews": {
    "$reviewId": {
      "userId": "string",
      "productId": "string",
      "rating": "number",
      "text": "string",
      "createdAt": "timestamp"
    }
  }
}`}
                  </pre>
                </div>
              </DataCard>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </MainLayout>
  );
};

export default DatabasePage;
