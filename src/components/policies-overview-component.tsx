'use client';
import { useState, useContext, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Shield, 
  Search, 
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';

interface Policy {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'inactive' | 'draft';
  version: string;
  effectiveDate: string;
  lastUpdated: string;
  createdBy: string;
  applicableTo: string[];
  content: string;
}

export default function PoliciesOverviewComponent() {
  const { toast } = useToast();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    title: '',
    description: '',
    category: '',
    content: '',
    applicableTo: [] as string[]
  });

  // Mock data - in real app, this would come from your backend
  const [policies, setPolicies] = useState<Policy[]>([
    {
      id: '1',
      title: 'Employee Code of Conduct',
      description: 'Guidelines for professional behavior and ethical standards',
      category: 'HR',
      status: 'active',
      version: '2.1',
      effectiveDate: '2024-01-01',
      lastUpdated: '2024-01-15',
      createdBy: 'HR Department',
      applicableTo: ['All Employees'],
      content: 'This policy outlines the expected behavior and ethical standards for all employees...'
    },
    {
      id: '2',
      title: 'Data Protection Policy',
      description: 'Guidelines for handling and protecting company data',
      category: 'IT',
      status: 'active',
      version: '1.3',
      effectiveDate: '2024-01-01',
      lastUpdated: '2024-02-01',
      createdBy: 'IT Department',
      applicableTo: ['All Employees', 'IT Staff'],
      content: 'This policy defines how company data should be handled, stored, and protected...'
    },
    {
      id: '3',
      title: 'Remote Work Policy',
      description: 'Guidelines for remote work arrangements',
      category: 'HR',
      status: 'active',
      version: '1.0',
      effectiveDate: '2024-01-01',
      lastUpdated: '2024-01-01',
      createdBy: 'HR Department',
      applicableTo: ['All Employees'],
      content: 'This policy outlines the terms and conditions for remote work arrangements...'
    },
    {
      id: '4',
      title: 'KPI Management Policy',
      description: 'Guidelines for KPI setting, tracking, and evaluation',
      category: 'Performance',
      status: 'active',
      version: '1.2',
      effectiveDate: '2024-01-01',
      lastUpdated: '2024-01-20',
      createdBy: 'Management',
      applicableTo: ['Managers', 'All Employees'],
      content: 'This policy defines the process for setting, tracking, and evaluating KPIs...'
    },
    {
      id: '5',
      title: 'Reward System Policy',
      description: 'Guidelines for employee rewards and recognition',
      category: 'Performance',
      status: 'draft',
      version: '1.0',
      effectiveDate: '2024-03-01',
      lastUpdated: '2024-02-15',
      createdBy: 'HR Department',
      applicableTo: ['All Employees'],
      content: 'This policy outlines the reward system and recognition programs...'
    }
  ]);

  const categories = ['HR', 'IT', 'Performance', 'Finance', 'Operations'];
  const statuses = ['active', 'inactive', 'draft'];

  // Filter policies based on search, category, and status
  const filteredPolicies = useMemo(() => {
    return policies.filter(policy => {
      const matchesSearch = policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           policy.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           policy.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || policy.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || policy.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [policies, searchTerm, selectedCategory, selectedStatus]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalPolicies = policies.length;
    const activePolicies = policies.filter(p => p.status === 'active').length;
    const draftPolicies = policies.filter(p => p.status === 'draft').length;
    const categoriesCount = [...new Set(policies.map(p => p.category))].length;

    return {
      totalPolicies,
      activePolicies,
      draftPolicies,
      categoriesCount
    };
  }, [policies]);

  const handleViewPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setIsDialogOpen(true);
  };

  const handleCreatePolicy = () => {
    if (!newPolicy.title || !newPolicy.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const policy: Policy = {
      id: Date.now().toString(),
      title: newPolicy.title,
      description: newPolicy.description,
      category: newPolicy.category,
      status: 'draft',
      version: '1.0',
      effectiveDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      createdBy: 'Current User',
      applicableTo: newPolicy.applicableTo,
      content: newPolicy.content
    };

    setPolicies(prev => [...prev, policy]);
    
    toast({
      title: "Success",
      description: "Policy created successfully",
    });
    
    setIsCreateDialogOpen(false);
    setNewPolicy({
      title: '',
      description: '',
      category: '',
      content: '',
      applicableTo: []
    });
  };

  const handleDeletePolicy = (policyId: string) => {
    setPolicies(prev => prev.filter(p => p.id !== policyId));
    toast({
      title: "Success",
      description: "Policy deleted successfully",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="w-4 h-4" />;
      case 'inactive': return <AlertTriangle className="w-4 h-4" />;
      case 'draft': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedPolicy(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Policies Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage company policies and procedures
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Policy
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPolicies}</div>
            <p className="text-xs text-muted-foreground">All policies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activePolicies}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Policies</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.draftPolicies}</div>
            <p className="text-xs text-muted-foreground">Under review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.categoriesCount}</div>
            <p className="text-xs text-muted-foreground">Policy categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Policies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Policies ({filteredPolicies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPolicies.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No policies found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                  ? 'No policies match your search criteria.' 
                  : 'No policies available.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPolicies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{policy.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {policy.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{policy.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(policy.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(policy.status)}
                          <span className="capitalize">{policy.status}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{policy.version}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span>{new Date(policy.effectiveDate).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span>{new Date(policy.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPolicy(policy)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePolicy(policy.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Policy Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {selectedPolicy?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedPolicy?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPolicy && (
            <div className="space-y-6">
              {/* Policy Info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <Badge variant="outline" className="mb-2">{selectedPolicy.category}</Badge>
                  <p className="text-sm text-muted-foreground">Category</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Badge className={getStatusColor(selectedPolicy.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(selectedPolicy.status)}
                      <span className="capitalize">{selectedPolicy.status}</span>
                    </div>
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">Status</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <span className="text-2xl font-bold">{selectedPolicy.version}</span>
                  <p className="text-sm text-muted-foreground">Version</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <span className="text-sm font-medium">{selectedPolicy.createdBy}</span>
                  <p className="text-sm text-muted-foreground">Created By</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Effective Date</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedPolicy.effectiveDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span className="font-medium">Last Updated</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedPolicy.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Applicable To */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  Applicable To
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPolicy.applicableTo.map((group, index) => (
                    <Badge key={index} variant="secondary">
                      {group}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Policy Content */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-500" />
                  Policy Content
                </h3>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <p className="text-sm whitespace-pre-wrap">{selectedPolicy.content}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Policy Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Policy
            </DialogTitle>
            <DialogDescription>
              Create a new company policy
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="policy-title">Policy Title *</Label>
              <Input
                id="policy-title"
                value={newPolicy.title}
                onChange={(e) => setNewPolicy(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter policy title"
              />
            </div>

            <div>
              <Label htmlFor="policy-description">Description</Label>
              <Textarea
                id="policy-description"
                value={newPolicy.description}
                onChange={(e) => setNewPolicy(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter policy description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="policy-category">Category *</Label>
              <Select value={newPolicy.category} onValueChange={(value) => setNewPolicy(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="policy-content">Policy Content</Label>
              <Textarea
                id="policy-content"
                value={newPolicy.content}
                onChange={(e) => setNewPolicy(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter policy content"
                rows={6}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => setIsCreateDialogOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePolicy}
                className="flex-1"
                disabled={!newPolicy.title || !newPolicy.category}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Policy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
