import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  Key,
  Check,
  X,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  TestTube,
  Trash2,
  Shield,
  Info,
} from 'lucide-react';

interface APIKey {
  provider: string;
  displayName: string;
  description: string;
  value: string;
  isConfigured: boolean;
  isValid?: boolean;
  required: boolean;
  docUrl?: string;
}

const API_PROVIDERS: APIKey[] = [
  {
    provider: 'anthropic',
    displayName: 'Anthropic (Claude)',
    description: 'Required for advanced lead enrichment and content analysis',
    value: '',
    isConfigured: false,
    required: true,
    docUrl: 'https://console.anthropic.com/keys',
  },
  {
    provider: 'openai',
    displayName: 'OpenAI',
    description: 'Fallback AI provider for image analysis and mobile extraction',
    value: '',
    isConfigured: false,
    required: true,
    docUrl: 'https://platform.openai.com/api-keys',
  },
  {
    provider: 'perplexity',
    displayName: 'Perplexity AI',
    description: 'Real-time web search for company information',
    value: '',
    isConfigured: false,
    required: false,
    docUrl: 'https://www.perplexity.ai/settings/api',
  },
  {
    provider: 'deepseek',
    displayName: 'DeepSeek',
    description: 'Cost-effective bulk processing',
    value: '',
    isConfigured: false,
    required: false,
    docUrl: 'https://platform.deepseek.com/api_keys',
  },
  {
    provider: 'google_maps',
    displayName: 'Google Maps',
    description: 'Location and business data enrichment',
    value: '',
    isConfigured: false,
    required: false,
    docUrl: 'https://console.cloud.google.com/apis/credentials',
  },
  {
    provider: 'n8n',
    displayName: 'N8N Workflow',
    description: 'Workflow automation integration',
    value: '',
    isConfigured: false,
    required: false,
    docUrl: 'https://docs.n8n.io/api/',
  },
];

export default function APIKeyManager() {
  const [keys, setKeys] = useState<APIKey[]>(API_PROVIDERS);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [clearAllDialog, setClearAllDialog] = useState(false);
  const { toast } = useToast();

  // Load existing keys on mount
  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const response = await fetch('/api/keys');
      const data = await response.json();
      
      if (data.success) {
        const statusResponse = await fetch('/api/keys/status');
        const statusData = await statusResponse.json();
        
        setKeys(prevKeys =>
          prevKeys.map(key => ({
            ...key,
            value: data.keys[key.provider] || '',
            isConfigured: statusData.status[key.provider] || false,
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load keys:', error);
      toast({
        title: 'Error',
        description: 'Failed to load API keys',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const keysToSave = keys.reduce((acc, key) => {
        if (key.value && !key.value.includes('...')) {
          acc[key.provider] = key.value;
        }
        return acc;
      }, {} as Record<string, string>);
      
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keysToSave),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'API keys saved securely',
        });
        await loadKeys();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save API keys',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (provider: string, value: string) => {
    setTesting({ ...testing, [provider]: true });
    
    try {
      const response = await fetch('/api/keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, key: value }),
      });
      
      const data = await response.json();
      
      setKeys(prevKeys =>
        prevKeys.map(key =>
          key.provider === provider
            ? { ...key, isValid: data.valid }
            : key
        )
      );
      
      toast({
        title: data.valid ? 'Valid Key' : 'Invalid Key',
        description: data.message,
        variant: data.valid ? 'default' : 'destructive',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to test API key',
        variant: 'destructive',
      });
    } finally {
      setTesting({ ...testing, [provider]: false });
    }
  };

  const handleDelete = async (provider: string) => {
    try {
      const response = await fetch(`/api/keys/${provider}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: `${provider} key deleted`,
        });
        await loadKeys();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete key',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialog(null);
    }
  };

  const handleClearAll = async () => {
    try {
      const response = await fetch('/api/keys', {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'All API keys cleared',
        });
        await loadKeys();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear keys',
        variant: 'destructive',
      });
    } finally {
      setClearAllDialog(false);
    }
  };

  const toggleShowValue = (provider: string) => {
    setShowValues(prev => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  const updateKeyValue = (provider: string, value: string) => {
    setKeys(prevKeys =>
      prevKeys.map(key =>
        key.provider === provider ? { ...key, value } : key
      )
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                API Key Management
              </CardTitle>
              <CardDescription>
                Configure your API keys securely. Keys are encrypted and never exposed in code.
              </CardDescription>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setClearAllDialog(true)}
            >
              Clear All Keys
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>For Production:</strong> Customers will need to provide their own API keys.
              <br />
              <strong>For Testing:</strong> You can add your keys here temporarily.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="required" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="required">Required Keys</TabsTrigger>
              <TabsTrigger value="optional">Optional Keys</TabsTrigger>
            </TabsList>

            <TabsContent value="required" className="space-y-4">
              {keys
                .filter(key => key.required)
                .map(key => (
                  <Card key={key.provider}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Key className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <h4 className="font-medium">{key.displayName}</h4>
                              <p className="text-sm text-muted-foreground">
                                {key.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {key.isConfigured && (
                              <Badge variant="success">
                                <Check className="h-3 w-3 mr-1" />
                                Configured
                              </Badge>
                            )}
                            {key.isValid === true && (
                              <Badge variant="success">Valid</Badge>
                            )}
                            {key.isValid === false && (
                              <Badge variant="destructive">Invalid</Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <Input
                              type={showValues[key.provider] ? 'text' : 'password'}
                              value={key.value}
                              onChange={(e) => updateKeyValue(key.provider, e.target.value)}
                              placeholder={`Enter ${key.displayName} API key`}
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => toggleShowValue(key.provider)}
                            >
                              {showValues[key.provider] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleTest(key.provider, key.value)}
                            disabled={!key.value || testing[key.provider]}
                          >
                            {testing[key.provider] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <TestTube className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeleteDialog(key.provider)}
                            disabled={!key.isConfigured}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {key.docUrl && (
                          <a
                            href={key.docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline"
                          >
                            Get your {key.displayName} API key →
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>

            <TabsContent value="optional" className="space-y-4">
              {keys
                .filter(key => !key.required)
                .map(key => (
                  <Card key={key.provider}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Key className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <h4 className="font-medium">{key.displayName}</h4>
                              <p className="text-sm text-muted-foreground">
                                {key.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {key.isConfigured && (
                              <Badge variant="outline">
                                <Check className="h-3 w-3 mr-1" />
                                Configured
                              </Badge>
                            )}
                            {key.isValid === true && (
                              <Badge variant="success">Valid</Badge>
                            )}
                            {key.isValid === false && (
                              <Badge variant="destructive">Invalid</Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <Input
                              type={showValues[key.provider] ? 'text' : 'password'}
                              value={key.value}
                              onChange={(e) => updateKeyValue(key.provider, e.target.value)}
                              placeholder={`Enter ${key.displayName} API key (optional)`}
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => toggleShowValue(key.provider)}
                            >
                              {showValues[key.provider] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleTest(key.provider, key.value)}
                            disabled={!key.value || testing[key.provider]}
                          >
                            {testing[key.provider] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <TestTube className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeleteDialog(key.provider)}
                            disabled={!key.isConfigured}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {key.docUrl && (
                          <a
                            href={key.docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline"
                          >
                            Get your {key.displayName} API key →
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Save Keys Securely
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this API key? You'll need to re-enter it later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialog && handleDelete(deleteDialog)}
            >
              Delete Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear All Dialog */}
      <Dialog open={clearAllDialog} onOpenChange={setClearAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear All API Keys</DialogTitle>
            <DialogDescription>
              This will remove all stored API keys. You'll need to re-enter them to use the application.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearAllDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearAll}>
              Clear All Keys
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}