'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FolderOpen, 
  CheckCircle2,
  AlertTriangle,
  Settings,
  Upload,
  Download,
  RefreshCw,
  Link,
  Shield,
  Database,
  FileText,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';

interface GoogleDriveConfig {
  isConnected: boolean;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken: string;
  refreshToken: string;
  folderId: string;
  folderName: string;
  permissions: string[];
  syncEnabled: boolean;
  autoSync: boolean;
  syncInterval: number; // minutes
  lastSync: string;
  totalFiles: number;
  usedSpace: string;
  maxSpace: string;
}

export default function GoogleDriveConfigComponent() {
  const { toast } = useToast();
  const { t } = useLanguage();

  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [config, setConfig] = useState<GoogleDriveConfig>({
    isConnected: false,
    clientId: '',
    clientSecret: '',
    redirectUri: '',
    accessToken: '',
    refreshToken: '',
    folderId: '',
    folderName: '',
    permissions: ['read', 'write'],
    syncEnabled: true,
    autoSync: true,
    syncInterval: 30,
    lastSync: '',
    totalFiles: 0,
    usedSpace: '0 GB',
    maxSpace: '15 GB'
  });

  const [credentials, setCredentials] = useState({
    clientId: '',
    clientSecret: '',
    redirectUri: 'http://localhost:3000/auth/google/callback'
  });

  const handleConnectGoogleDrive = async () => {
    setIsConnecting(true);
    try {
      // Simulate Google Drive connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setConfig(prev => ({
        ...prev,
        isConnected: true,
        clientId: credentials.clientId,
        clientSecret: credentials.clientSecret,
        redirectUri: credentials.redirectUri,
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        folderId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        folderName: 'KPI Central Files',
        lastSync: new Date().toISOString(),
        totalFiles: 156,
        usedSpace: '2.3 GB'
      }));
      
      toast({
        title: "Success",
        description: "Google Drive connected successfully",
      });
    } catch (error) {
      console.error('Error connecting to Google Drive:', error);
      toast({
        title: "Error",
        description: "Failed to connect to Google Drive",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectGoogleDrive = () => {
    setConfig(prev => ({
      ...prev,
      isConnected: false,
      accessToken: '',
      refreshToken: '',
      folderId: '',
      folderName: '',
      lastSync: '',
      totalFiles: 0,
      usedSpace: '0 GB'
    }));
    
    toast({
      title: "Disconnected",
      description: "Google Drive has been disconnected",
    });
  };

  const handleSyncFiles = async () => {
    setIsSyncing(true);
    try {
      // Simulate file sync
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setConfig(prev => ({
        ...prev,
        lastSync: new Date().toISOString(),
        totalFiles: prev.totalFiles + Math.floor(Math.random() * 10)
      }));
      
      toast({
        title: "Sync Complete",
        description: "Files synchronized successfully",
      });
    } catch (error) {
      console.error('Error syncing files:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to synchronize files",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Connection Test",
        description: "Google Drive connection is working properly",
      });
    } catch (error) {
      toast({
        title: "Connection Test Failed",
        description: "Unable to connect to Google Drive",
        variant: "destructive",
      });
    }
  };

  const updateConfig = (key: keyof GoogleDriveConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateCredentials = (key: keyof typeof credentials, value: string) => {
    setCredentials(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Google Drive Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure Google Drive integration for file storage and synchronization
          </p>
        </div>
        <div className="flex items-center gap-2">
          {config.isConnected && (
            <Button 
              onClick={handleTestConnection}
              variant="outline"
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Test Connection
            </Button>
          )}
          {config.isConnected ? (
            <Button 
              onClick={handleDisconnectGoogleDrive}
              variant="outline"
              className="flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Disconnect
            </Button>
          ) : (
            <Button 
              onClick={handleConnectGoogleDrive}
              disabled={isConnecting || !credentials.clientId || !credentials.clientSecret}
              className="flex items-center gap-2"
            >
              <Link className="w-4 h-4" />
              {isConnecting ? 'Connecting...' : 'Connect Google Drive'}
            </Button>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {config.isConnected ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-500" />
              )}
              <div>
                <p className="font-medium">
                  {config.isConnected ? 'Connected to Google Drive' : 'Not Connected'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {config.isConnected 
                    ? `Last sync: ${config.lastSync ? new Date(config.lastSync).toLocaleString() : 'Never'}`
                    : 'Configure credentials to connect'
                  }
                </p>
              </div>
            </div>
            <Badge variant={config.isConnected ? "default" : "secondary"}>
              {config.isConnected ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Google Drive Credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Google Drive Credentials
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client-id">Client ID</Label>
              <Input
                id="client-id"
                value={credentials.clientId}
                onChange={(e) => updateCredentials('clientId', e.target.value)}
                placeholder="Enter Google Drive Client ID"
                disabled={config.isConnected}
              />
            </div>
            <div>
              <Label htmlFor="client-secret">Client Secret</Label>
              <Input
                id="client-secret"
                type="password"
                value={credentials.clientSecret}
                onChange={(e) => updateCredentials('clientSecret', e.target.value)}
                placeholder="Enter Google Drive Client Secret"
                disabled={config.isConnected}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="redirect-uri">Redirect URI</Label>
            <Input
              id="redirect-uri"
              value={credentials.redirectUri}
              onChange={(e) => updateCredentials('redirectUri', e.target.value)}
              placeholder="Enter redirect URI"
              disabled={config.isConnected}
            />
            <p className="text-sm text-muted-foreground mt-1">
              This should match the redirect URI configured in your Google Cloud Console
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Drive Information */}
      {config.isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Drive Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Connected Folder</Label>
                  <p className="text-sm text-muted-foreground">{config.folderName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Folder ID</Label>
                  <p className="text-sm text-muted-foreground font-mono">{config.folderId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Permissions</Label>
                  <div className="flex gap-2 mt-1">
                    {config.permissions.map(permission => (
                      <Badge key={permission} variant="outline">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Total Files</Label>
                  <p className="text-2xl font-bold">{config.totalFiles}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Storage Used</Label>
                  <p className="text-sm text-muted-foreground">
                    {config.usedSpace} / {config.maxSpace}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(parseFloat(config.usedSpace) / parseFloat(config.maxSpace)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Synchronization Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sync-enabled">Enable Synchronization</Label>
              <p className="text-sm text-muted-foreground">Allow file sync with Google Drive</p>
            </div>
            <Switch
              id="sync-enabled"
              checked={config.syncEnabled}
              onCheckedChange={(checked) => updateConfig('syncEnabled', checked)}
              disabled={!config.isConnected}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-sync">Auto Synchronization</Label>
              <p className="text-sm text-muted-foreground">Automatically sync files at intervals</p>
            </div>
            <Switch
              id="auto-sync"
              checked={config.autoSync}
              onCheckedChange={(checked) => updateConfig('autoSync', checked)}
              disabled={!config.isConnected || !config.syncEnabled}
            />
          </div>
          
          <div>
            <Label htmlFor="sync-interval">Sync Interval (minutes)</Label>
            <Input
              id="sync-interval"
              type="number"
              value={config.syncInterval}
              onChange={(e) => updateConfig('syncInterval', parseInt(e.target.value))}
              min="5"
              max="1440"
              disabled={!config.isConnected || !config.syncEnabled || !config.autoSync}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSyncFiles}
              disabled={!config.isConnected || !config.syncEnabled || isSyncing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Management */}
      {config.isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              File Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Files
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Files
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Manage Permissions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help & Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Help & Documentation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">How to set up Google Drive integration:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Go to Google Cloud Console and create a new project</li>
                <li>Enable Google Drive API for your project</li>
                <li>Create OAuth 2.0 credentials (Client ID and Client Secret)</li>
                <li>Add the redirect URI to your OAuth configuration</li>
                <li>Enter the credentials in the form above</li>
                <li>Click "Connect Google Drive" to authorize the application</li>
              </ol>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                View Documentation
              </Button>
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
