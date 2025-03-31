
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Check, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AiApiKeysFormProps {
  onKeysUpdate: (keys: { perplexity?: string; openai?: string; claude?: string }) => void;
  initialKeys?: { perplexity?: string; openai?: string; claude?: string };
}

const AiApiKeysForm: React.FC<AiApiKeysFormProps> = ({ onKeysUpdate, initialKeys = {} }) => {
  const [perplexityKey, setPerplexityKey] = useState(initialKeys.perplexity || '');
  const [openaiKey, setOpenaiKey] = useState(initialKeys.openai || '');
  const [claudeKey, setClaudeKey] = useState(initialKeys.claude || '');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    setIsSaving(true);
    
    // In a real app, you might save these to a secure location
    // For now, we'll just pass them to the parent component
    try {
      onKeysUpdate({
        perplexity: perplexityKey || undefined,
        openai: openaiKey || undefined,
        claude: claudeKey || undefined
      });
      
      // Store in localStorage (not recommended for production, just for demo)
      if (perplexityKey) localStorage.setItem('perplexity_api_key', perplexityKey);
      if (openaiKey) localStorage.setItem('openai_api_key', openaiKey);
      if (claudeKey) localStorage.setItem('claude_api_key', claudeKey);
      
      toast({
        title: "API keys saved",
        description: "Your AI API keys have been saved successfully.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving API keys:', error);
      toast({
        title: "Error saving API keys",
        description: "There was an error saving your API keys.",
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
          AI API Keys
        </CardTitle>
        <CardDescription>
          Enter your API keys to enable AI features. Your keys are stored locally and never sent to our servers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="perplexity-key">Perplexity API Key (for Research)</Label>
          <Input
            id="perplexity-key"
            value={perplexityKey}
            onChange={(e) => setPerplexityKey(e.target.value)}
            type="password"
            placeholder="sk_xxxxxxxxxxxxxxxxxx"
          />
          <p className="text-xs text-muted-foreground">
            Get a key from <a href="https://www.perplexity.ai/settings/api" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Perplexity API</a>
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="openai-key">OpenAI API Key (for Critique)</Label>
          <Input
            id="openai-key"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            type="password"
            placeholder="sk-xxxxxxxxxxxxxxxxxx"
          />
          <p className="text-xs text-muted-foreground">
            Get a key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">OpenAI</a>
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="claude-key">Claude API Key (for Expansion)</Label>
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
              For demonstration purposes, API keys are stored in browser storage. In a production environment, these should be stored securely on the server side and accessed via environment variables.
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
              Save API Keys
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AiApiKeysForm;
