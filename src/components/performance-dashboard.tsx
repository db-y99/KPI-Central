'use client';

import { useState, useEffect, useRef } from 'react';
import { BarChart3, TrendingUp, Clock, AlertTriangle, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { performanceService, PerformanceHooks, type PerformanceReport } from '@/lib/performance-service';
import { useLanguage } from '@/context/language-context';

export function PerformanceDashboard() {
  const { t } = useLanguage();
  const [performanceReport, setPerformanceReport] = useState<PerformanceReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    pageLoadTime: 0,
    apiResponseTime: 0,
    activeUsers: 0,
    errorRate: 0
  });

  useEffect(() => {
    loadPerformanceReport();
    startRealTimeMonitoring();
    
    // Initialize performance monitoring
    performanceService.initialize();
    
    return () => {
      performanceService.cleanup();
    };
  }, []);

  const loadPerformanceReport = async () => {
    setIsLoading(true);
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // Last 7 days
      
      const report = await performanceService.getPerformanceReport(startDate, endDate);
      setPerformanceReport(report);
    } catch (error) {
      console.error('Error loading performance report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startRealTimeMonitoring = () => {
    // Simulate real-time metrics updates
    const interval = setInterval(() => {
      setRealTimeMetrics(prev => ({
        pageLoadTime: Math.random() * 2000 + 500, // 500-2500ms
        apiResponseTime: Math.random() * 500 + 100, // 100-600ms
        activeUsers: Math.floor(Math.random() * 50) + 10, // 10-60 users
        errorRate: Math.random() * 0.05 // 0-5%
      }));
    }, 5000);

    return () => clearInterval(interval);
  };

  const getPerformanceStatus = (loadTime: number) => {
    if (loadTime < 1000) return { status: 'excellent', color: 'text-green-600' };
    if (loadTime < 2000) return { status: 'good', color: 'text-yellow-600' };
    if (loadTime < 3000) return { status: 'fair', color: 'text-orange-600' };
    return { status: 'poor', color: 'text-red-600' };
  };

  const getErrorRateStatus = (errorRate: number) => {
    if (errorRate < 0.01) return { status: 'low', color: 'text-green-600' };
    if (errorRate < 0.03) return { status: 'medium', color: 'text-yellow-600' };
    return { status: 'high', color: 'text-red-600' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor system performance and optimization metrics
          </p>
        </div>
        <Button onClick={loadPerformanceReport} disabled={isLoading}>
          Refresh Report
        </Button>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Page Load Time</p>
                <p className={`text-2xl font-bold ${getPerformanceStatus(realTimeMetrics.pageLoadTime).color}`}>
                  {realTimeMetrics.pageLoadTime.toFixed(0)}ms
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">API Response Time</p>
                <p className="text-2xl font-bold text-green-600">
                  {realTimeMetrics.apiResponseTime.toFixed(0)}ms
                </p>
              </div>
              <Zap className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-blue-600">
                  {realTimeMetrics.activeUsers}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
                <p className={`text-2xl font-bold ${getErrorRateStatus(realTimeMetrics.errorRate).color}`}>
                  {(realTimeMetrics.errorRate * 100).toFixed(2)}%
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Report */}
      {performanceReport && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pages">Page Performance</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                  <CardDescription>
                    Overall performance metrics for the last 7 days
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Page Load Time</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${getPerformanceStatus(performanceReport.metrics.averagePageLoadTime).color}`}>
                        {performanceReport.metrics.averagePageLoadTime.toFixed(0)}ms
                      </span>
                      <Badge variant="outline">
                        {getPerformanceStatus(performanceReport.metrics.averagePageLoadTime).status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">User Engagement</span>
                    <span className="font-bold text-blue-600">
                      {performanceReport.metrics.userEngagement.toFixed(1)} interactions/user
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Error Rate</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${getErrorRateStatus(performanceReport.metrics.errorRate).color}`}>
                        {(performanceReport.metrics.errorRate * 100).toFixed(2)}%
                      </span>
                      <Badge variant="outline">
                        {getErrorRateStatus(performanceReport.metrics.errorRate).status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Sessions</span>
                    <span className="font-bold text-green-600">
                      {performanceReport.metrics.totalSessions}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Unique Users</span>
                    <span className="font-bold text-purple-600">
                      {performanceReport.metrics.uniqueUsers}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>
                    Performance trends over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Page load times are stable</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">User engagement is increasing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">Error rate needs attention</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Page Performance</CardTitle>
                <CardDescription>
                  Performance metrics for individual pages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page</TableHead>
                      <TableHead>Average Load Time</TableHead>
                      <TableHead>Requests</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performanceReport.metrics.slowestPages.map((page, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{page.page}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono">{page.avgTime.toFixed(0)}ms</span>
                            <Progress 
                              value={Math.min((page.avgTime / 3000) * 100, 100)} 
                              className="w-20"
                            />
                          </div>
                        </TableCell>
                        <TableCell>{page.count}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getPerformanceStatus(page.avgTime).status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Recommendations</CardTitle>
                <CardDescription>
                  Automated recommendations to improve performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceReport.recommendations.map((recommendation, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>{recommendation}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Performance Optimization Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Optimization Tools</CardTitle>
          <CardDescription>
            Tools to help optimize system performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <BarChart3 className="w-6 h-6" />
              <span>Cache Analysis</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Zap className="w-6 h-6" />
              <span>Database Optimization</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <TrendingUp className="w-6 h-6" />
              <span>Performance Profiling</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState({
    pageLoadTime: 0,
    apiResponseTime: 0,
    errorCount: 0
  });

  useEffect(() => {
    // Initialize performance monitoring
    performanceService.initialize();
    
    // Track page load
    const startTime = performance.now();
    window.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, pageLoadTime: loadTime }));
    });

    return () => {
      performanceService.cleanup();
    };
  }, []);

  const trackApiCall = (endpoint: string, method: string, duration: number, statusCode: number) => {
    PerformanceHooks.trackApiCall(endpoint, method, duration, statusCode, 'current-user', 'current-session');
    setMetrics(prev => ({ ...prev, apiResponseTime: duration }));
  };

  const trackInteraction = (element: string, action: string, duration: number) => {
    PerformanceHooks.trackInteraction(element, action, duration, 'current-user', 'current-session');
  };

  return {
    metrics,
    trackApiCall,
    trackInteraction
  };
}
