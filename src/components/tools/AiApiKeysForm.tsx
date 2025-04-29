
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Check, Key, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiServiceManager } from '@/services/ai/AiServiceManager';

interface AiApiKeysFormProps {
  onKeysUpdate: (keys: { perplexity?: string; openai?: string; claude?: string }) => void;
  initialKeys?: { perplexity?: string; openai?: string; claude?: string };
}

const AiApiKeysForm: React.FC<AiApiKeysFormProps> = ({ onKeysUpdate, initialKeys = {} }) => {
  const [perplexityKey, setPerplexityKey] = useState(initialKeys.perplexity || '');
  const [openaiKey, setOpenaiKey] = useState(initialKeys.openai || '');
  const [claudeKey, setClaudeKey] = useState(initialKeys.claude || '');
  const [isSaving, setIsSaving] = useState(false);
  const [testingClaudeKey, setTestingClaudeKey] = useState(false);
  const [claudeKeyValid, setClaudeKeyValid] = useState<boolean | null>(null);
  const { toast } = useToast();

  // Load initial keys from localStorage
  useEffect(() => {
    setPerplexityKey(localStorage.getItem('perplexity_api_key') || '');
    setOpenaiKey(localStorage.getItem('openai_api_key') || '');
    setClaudeKey(localStorage.getItem('claude_api_key') || '');
  }, []);

  // Function to test Claude API key
  const testClaudeApiKey = async (apiKey: string) => {
    if (!apiKey) {
      setClaudeKeyValid(null);
      return;
    }
    
    setTestingClaudeKey(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'anthropic-version': '2023-06-01',
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 10,
        }),
      });
      
      const valid = response.ok;
      setClaudeKeyValid(valid);
      
      if (!valid) {
        const errorData = await response.text();
        console.error('Claude API key test failed:', errorData);
      }
    } catch (error) {
      console.error('Error testing Claude API key:', error);
      setClaudeKeyValid(false);
    } finally {
      setTestingClaudeKey(false);
    }
  };

  // Handle Claude API key changes
  const handleClaudeKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setClaudeKey(newKey);
    setClaudeKeyValid(null); // Reset validation when key changes
  };

  // Validate Claude API key when blurred
  const handleClaudeKeyBlur = () => {
    if (claudeKey) {
      testClaudeApiKey(claudeKey);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    
    // Create object with only non-empty keys
    const keysToUpdate: {
      perplexity?: string;
      openai?: string;
      claude?: string;
    } = {};
    
    if (perplexityKey) keysToUpdate.perplexity = perplexityKey;
    if (openaiKey) keysToUpdate.openai = openaiKey;
    if (claudeKey) keysToUpdate.claude = claudeKey;
    
    try {
      // Store in localStorage
      if (perplexityKey) localStorage.setItem('perplexity_api_key', perplexityKey);
      else localStorage.removeItem('perplexity_api_key');
      
      if (openaiKey) localStorage.setItem('openai_api_key', openaiKey);
      else localStorage.removeItem('openai_api_key');
      
      if (claudeKey) localStorage.setItem('claude_api_key', claudeKey);
      else localStorage.removeItem('claude_api_key');
      
      // Update the aiServiceManager with new keys
      aiServiceManager.updateApiKeys(keysToUpdate);
      
      // Call the parent component's update function
      onKeysUpdate(keysToUpdate);
      
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
          Enter your API keys to enable AI features. Your keys are stored securely in your browser and never sent to our servers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="claude-key" className="flex items-center gap-2">
            Claude API Key (Required for AI Assistant)
            {testingClaudeKey && <Loader2 className="h-4 w-4 animate-spin" />}
            {claudeKeyValid === true && <Check className="h-4 w-4 text-green-500" />}
            {claudeKeyValid === false && <AlertCircle className="h-4 w-4 text-red-500" />}
          </Label>
          <Input
            id="claude-key"
            value={claudeKey}
            onChange={handleClaudeKeyChange}
            onBlur={handleClaudeKeyBlur}
            type="password"
            placeholder="sk-ant-xxxxxxxxxx"
            className={claudeKeyValid === false ? "border-red-500" : ""}
          />
          <p className="text-xs text-muted-foreground">
            Get a key from <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Anthropic</a>
          </p>
          {claudeKeyValid === false && (
            <p className="text-xs text-red-500">Invalid API key. Please check and try again.</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="openai-key">OpenAI API Key (Optional)</Label>
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
          <Label htmlFor="perplexity-key">Perplexity API Key (Optional)</Label>
          <Input
            id="perplexity-key"
            value={perplexityKey}
            onChange={(e) => setPerplexityKey(e.target.value)}
            type="password"
            placeholder="pplx-xxxxxxxxxxxxxxxxxx"
          />
          <p className="text-xs text-muted-foreground">
            Get a key from <a href="https://www.perplexity.ai/settings/api" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Perplexity API</a>
          </p>
        </div>
        
        <div className="bg-amber-50 text-amber-800 p-4 rounded-md flex gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Security Notice</p>
            <p className="text-xs mt-1">
              API keys are stored in your browser's local storage. For production use, consider server-side storage or environment variables.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
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
