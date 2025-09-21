'use client';

import { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { bulkImportService, type ImportTemplate, type ImportResult } from '@/lib/bulk-import-service';
import { useLanguage } from '@/context/language-context';

export function BulkImportExport() {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<ImportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ImportTemplate | null>(null);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load templates and results on component mount
  useState(() => {
    loadTemplates();
    loadImportResults();
  });

  const loadTemplates = async () => {
    try {
      const templateList = await bulkImportService.getTemplates();
      setTemplates(templateList);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadImportResults = async () => {
    try {
      // This would need userId from auth context
      const results = await bulkImportService.getImportResults('current-user-id');
      setImportResults(results);
    } catch (error) {
      console.error('Error loading import results:', error);
    }
  };

  const handleTemplateSelect = (template: ImportTemplate) => {
    setSelectedTemplate(template);
    setError(null);
  };

  const handleDownloadTemplate = async () => {
    if (!selectedTemplate) return;
    
    try {
      await bulkImportService.downloadTemplate(selectedTemplate.id);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to download template');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedTemplate) return;

    setImportStatus('uploading');
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Parse file
      const { data, errors } = await bulkImportService.parseFile(file, selectedTemplate.id);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setImportStatus('processing');

      if (errors.length > 0) {
        setError(`Found ${errors.length} validation errors. Please check your data.`);
        setImportStatus('error');
        return;
      }

      // Import data
      const result = await bulkImportService.importData(
        selectedTemplate.id,
        data,
        'current-user-id', // This would come from auth context
        file.name
      );

      setImportStatus('completed');
      await loadImportResults();
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Import failed');
      setImportStatus('error');
    } finally {
      setUploadProgress(0);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <X className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bulk Import/Export</h2>
          <p className="text-muted-foreground">
            Import and export data in bulk using Excel templates
          </p>
        </div>
      </div>

      <Tabs defaultValue="import" className="space-y-4">
        <TabsList>
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="export">Export Data</TabsTrigger>
          <TabsTrigger value="history">Import History</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Template</CardTitle>
                <CardDescription>
                  Choose a template for the type of data you want to import
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                      </div>
                      <Badge variant="outline">{template.type}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upload File</CardTitle>
                <CardDescription>
                  Upload your Excel file to import data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTemplate && (
                  <>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={handleDownloadTemplate}
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download Template
                      </Button>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Drop your Excel file here or click to browse
                      </p>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={importStatus === 'uploading' || importStatus === 'processing'}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>

                    {importStatus === 'uploading' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} />
                      </div>
                    )}

                    {importStatus === 'processing' && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        Processing data...
                      </div>
                    )}

                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {importStatus === 'completed' && (
                      <Alert>
                        <CheckCircle className="w-4 h-4" />
                        <AlertDescription>
                          Data imported successfully!
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}

                {!selectedTemplate && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Please select a template first</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>
                Export data to Excel format for analysis or backup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <FileSpreadsheet className="w-6 h-6" />
                  <span>Export Employees</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <FileSpreadsheet className="w-6 h-6" />
                  <span>Export KPIs</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <FileSpreadsheet className="w-6 h-6" />
                  <span>Export Metrics</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <FileSpreadsheet className="w-6 h-6" />
                  <span>Export Reports</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <FileSpreadsheet className="w-6 h-6" />
                  <span>Export Rewards</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <FileSpreadsheet className="w-6 h-6" />
                  <span>Export All Data</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import History</CardTitle>
              <CardDescription>
                View past import operations and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Results</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">
                        {result.fileName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{result.templateId}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.status)}
                          <Badge className={getStatusColor(result.status)}>
                            {result.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-green-600">
                            ✓ {result.successCount} successful
                          </div>
                          {result.errorCount > 0 && (
                            <div className="text-red-600">
                              ✗ {result.errorCount} errors
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(result.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
