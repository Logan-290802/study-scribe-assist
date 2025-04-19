
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Check, Key } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getAiServiceManager } from '@/services/ai/AiServiceManager';

interface AiApiKeysFormProps {
  onKeysUpdate?: (keys: { perplexity?: string; openai?: string; claude?: string }) => void;
}

const AiApiKeysForm: React.FC<AiApiKeysFormProps> = ({ onKeysUpdate }) => {
  const [claudeKey, setClaudeKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load saved API key on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('CLAUDE_API_KEY');
    if (savedKey) {
      setClaudeKey(savedKey);
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Create a new AI service manager with the provided API key
      await getAiServiceManager();
      
      // Store in localStorage (used by AiServiceManager)
      if (claudeKey) {
        localStorage.setItem('CLAUDE_API_KEY', claudeKey);
      } else {
        localStorage.removeItem('CLAUDE_API_KEY');
      }
      
      if (onKeysUpdate) {
        onKeysUpdate({ claude: claudeKey });
      }
      
      toast({
        title: "API key saved",
        description: "Your Claude API key has been saved successfully.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving API key:', error);
      toast({
        title: "Error saving API key",
        description: "There was an error saving your API key.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          AI API Key
        </CardTitle>
        <CardDescription>
          Enter your Claude API key to enable AI features. Your key is stored locally and never sent to our servers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="claude-key">Claude API Key</Label>
          <Input
            id="claude-key"
            value={claudeKey}
            onChange={(e) => setClaudeKey(e.target.value)}
            type="password"
            placeholder="sk-ant-xxxxxxxxxx"
          />
          <p className="text-xs text-muted-foreground">
            Get a key from <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Anthropic</a>
          </p>
        </div>
        
        <div className="bg-amber-50 text-amber-800 p-4 rounded-md flex gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Security Notice</p>
            <p className="text-xs mt-1">
              For demonstration purposes, API keys are stored in browser storage. In a production environment, these should be stored securely on the server side.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <>Saving...</>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Save API Key
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AiApiKeysForm;
