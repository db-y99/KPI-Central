'use client';

import { useState, useEffect } from 'react';
import { Zap, Play, Pause, Settings, Plus, TestTube, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiIntegrationService, defaultApiTemplates, type ApiIntegration, type ApiExecution, type ApiTemplate } from '@/lib/api-integration-service';
import { useLanguage } from '@/context/language-context';

export function ApiIntegrations() {
  const { t } = useLanguage();
  const [integrations, setIntegrations] = useState<ApiIntegration[]>([]);
  const [executions, setExecutions] = useState<ApiExecution[]>([]);
  const [templates, setTemplates] = useState<ApiTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<ApiIntegration | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [apiIntegrations, apiExecutions, apiTemplates] = await Promise.all([
        apiIntegrationService.getApiIntegrations(),
        apiIntegrationService.getApiExecutions(),
        apiIntegrationService.getApiTemplates()
      ]);
      
      setIntegrations(apiIntegrations);
      setExecutions(apiExecutions);
      setTemplates(apiTemplates);
    } catch (error) {
      console.error('Error loading API integration data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleIntegration = async (integrationId: string, isActive: boolean) => {
    try {
      await apiIntegrationService.updateApiIntegration(integrationId, { isActive });
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === integrationId ? { ...integration, isActive } : integration
        )
      );
    } catch (error) {
      console.error('Error toggling API integration:', error);
    }
  };

  const handleExecuteIntegration = async (integrationId: string) => {
    try {
      await apiIntegrationService.executeApiIntegration(integrationId, { test: true });
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error executing API integration:', error);
    }
  };

  const handleTestIntegration = async (integrationId: string, testData: any) => {
    try {
      const result = await apiIntegrationService.testApiIntegration(integrationId, testData);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: 0
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'webhook':
        return 'bg-blue-100 text-blue-800';
      case 'rest_api':
        return 'bg-green-100 text-green-800';
      case 'graphql':
        return 'bg-purple-100 text-purple-800';
      case 'sftp':
        return 'bg-orange-100 text-orange-800';
      case 'email':
        return 'bg-yellow-100 text-yellow-800';
      case 'sms':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'running':
        return <Activity className="w-4 h-4 text-blue-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const activeIntegrations = integrations.filter(integration => integration.isActive);
  const totalExecutions = executions.length;
  const successfulExecutions = executions.filter(exec => exec.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Integrations</h2>
          <p className="text-muted-foreground">
            Manage external API integrations and webhooks
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create API Integration</DialogTitle>
            </DialogHeader>
            <CreateApiIntegrationForm 
              onClose={() => setIsCreateDialogOpen(false)}
              onSuccess={() => {
                setIsCreateDialogOpen(false);
                loadData();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Integrations</p>
                <p className="text-2xl font-bold">{integrations.length}</p>
              </div>
              <Zap className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Integrations</p>
                <p className="text-2xl font-bold text-green-600">{activeIntegrations.length}</p>
              </div>
              <Play className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Executions</p>
                <p className="text-2xl font-bold text-purple-600">{totalExecutions}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="executions">Execution History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Integrations</CardTitle>
              <CardDescription>
                Manage your external API integrations and webhooks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Integration Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Executed</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {integrations.map((integration) => (
                    <TableRow key={integration.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{integration.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {integration.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(integration.type)}>
                          {integration.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono">
                          {integration.method} {integration.endpoint}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={integration.isActive}
                            onCheckedChange={(checked) => handleToggleIntegration(integration.id, checked)}
                          />
                          <span className="text-sm">
                            {integration.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {integration.lastExecuted ? 
                            new Date(integration.lastExecuted).toLocaleString() : 
                            'Never'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExecuteIntegration(integration.id)}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedIntegration(integration);
                              setIsTestDialogOpen(true);
                            }}
                          >
                            <TestTube className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Execution History</CardTitle>
              <CardDescription>
                View past API integration executions and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Integration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Error</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executions.map((execution) => (
                    <TableRow key={execution.id}>
                      <TableCell>
                        <div className="font-medium">
                          {integrations.find(i => i.id === execution.integrationId)?.name || 'Unknown Integration'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(execution.status)}
                          <Badge className={getStatusColor(execution.status)}>
                            {execution.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(execution.startedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {execution.duration ? `${execution.duration}ms` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {execution.error ? (
                          <div className="text-sm text-red-600 max-w-xs truncate">
                            {execution.error}
                          </div>
                        ) : (
                          <span className="text-sm text-green-600">Success</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Templates</CardTitle>
              <CardDescription>
                Use predefined templates to create integrations quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Badge className={getTypeColor(template.type)}>
                          {template.type}
                        </Badge>
                        {template.isDefault && (
                          <Badge className="bg-blue-100 text-blue-800">Default</Badge>
                        )}
                      </div>
                      <Button 
                        className="w-full mt-4"
                        onClick={() => {
                          // This would open the create form with template pre-filled
                          setIsCreateDialogOpen(true);
                        }}
                      >
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Integration Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test API Integration</DialogTitle>
          </DialogHeader>
          <TestApiIntegrationForm
            integration={selectedIntegration}
            onTest={handleTestIntegration}
            testResult={testResult}
            onClose={() => {
              setIsTestDialogOpen(false);
              setTestResult(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Create API Integration Form Component
function CreateApiIntegrationForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'rest_api',
    endpoint: '',
    method: 'POST',
    headers: {} as Record<string, string>,
    authentication: {
      type: 'none',
      credentials: {} as Record<string, string>
    },
    payload: {
      template: '',
      fields: [] as string[]
    },
    triggers: {
      events: [] as string[],
      conditions: {} as Record<string, any>
    },
    isActive: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiIntegrationService.createApiIntegration({
        ...formData,
        type: formData.type as 'email' | 'sms' | 'rest_api' | 'webhook' | 'graphql' | 'sftp',
        authentication: {
          ...formData.authentication,
          type: formData.authentication.type as 'none' | 'bearer' | 'basic' | 'api_key' | 'oauth2'
        },
        createdBy: 'current-user-id' // This would come from auth context
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating API integration:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Integration Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="webhook">Webhook</SelectItem>
              <SelectItem value="rest_api">REST API</SelectItem>
              <SelectItem value="graphql">GraphQL</SelectItem>
              <SelectItem value="sftp">SFTP</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="endpoint">Endpoint URL</Label>
          <Input
            id="endpoint"
            value={formData.endpoint}
            onChange={(e) => setFormData(prev => ({ ...prev, endpoint: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="method">HTTP Method</Label>
          <Select
            value={formData.method}
            onValueChange={(value) => setFormData(prev => ({ ...prev, method: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="payload">Payload Template</Label>
        <Textarea
          id="payload"
          value={formData.payload.template}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            payload: { ...prev.payload, template: e.target.value }
          }))}
          placeholder='{"message": "{{message}}", "timestamp": "{{timestamp}}"}'
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Create Integration
        </Button>
      </div>
    </form>
  );
}

// Test API Integration Form Component
function TestApiIntegrationForm({ 
  integration, 
  onTest, 
  testResult, 
  onClose 
}: { 
  integration: ApiIntegration | null;
  onTest: (integrationId: string, testData: any) => void;
  testResult: any;
  onClose: () => void;
}) {
  const [testData, setTestData] = useState('{"test": "data"}');

  const handleTest = () => {
    if (integration) {
      try {
        const data = JSON.parse(testData);
        onTest(integration.id, data);
      } catch (error) {
        alert('Invalid JSON format');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="testData">Test Data (JSON)</Label>
        <Textarea
          id="testData"
          value={testData}
          onChange={(e) => setTestData(e.target.value)}
          placeholder='{"message": "Hello World", "timestamp": "2024-01-01"}'
        />
      </div>

      <Button onClick={handleTest} className="w-full">
        <TestTube className="w-4 h-4 mr-2" />
        Test Integration
      </Button>

      {testResult && (
        <div className="space-y-2">
          <Label>Test Result</Label>
          <Alert variant={testResult.success ? 'default' : 'destructive'}>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <Badge className={testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {testResult.success ? 'Success' : 'Failed'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Duration:</span>
                  <span>{testResult.duration}ms</span>
                </div>
                {testResult.error && (
                  <div>
                    <span className="font-medium">Error:</span>
                    <div className="text-sm mt-1">{testResult.error}</div>
                  </div>
                )}
                {testResult.responseData && (
                  <div>
                    <span className="font-medium">Response:</span>
                    <pre className="text-sm mt-1 bg-gray-100 p-2 rounded">
                      {JSON.stringify(testResult.responseData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
