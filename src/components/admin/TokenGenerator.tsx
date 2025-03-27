
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Clipboard, Check, KeyRound } from "lucide-react";
import { DataCard } from "@/components/ui/DataCard";
import { toast } from "sonner";

export function TokenGenerator() {
  const { generateToken } = useAuth();
  const [service, setService] = useState<"netflix" | "prime">("netflix");
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateToken = async () => {
    const newToken = await generateToken(service);
    setToken(newToken);
  };

  const copyToClipboard = () => {
    if (!token) return;
    
    navigator.clipboard.writeText(token)
      .then(() => {
        setCopied(true);
        toast.success("Token copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast.error("Failed to copy token");
      });
  };

  return (
    <DataCard title="Generate Access Tokens">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Token Generator</CardTitle>
          <CardDescription>
            Generate invitation tokens for new users. These tokens are required for signup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Select Service</label>
            <Select
              value={service}
              onValueChange={(value) => setService(value as "netflix" | "prime")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="netflix">Netflix</SelectItem>
                <SelectItem value="prime">Prime</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {token && (
            <div>
              <label className="text-sm font-medium mb-1 block">Generated Token</label>
              <div className="flex items-center mt-1">
                <Input value={token} readOnly className="bg-muted font-mono" />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="ml-2"
                  onClick={copyToClipboard}
                >
                  {copied ? <Check size={16} /> : <Clipboard size={16} />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This token will expire in 7 days and can only be used once.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGenerateToken} 
            className="w-full"
          >
            <KeyRound className="mr-2 h-4 w-4" /> Generate New Token
          </Button>
        </CardFooter>
      </Card>
    </DataCard>
  );
}
