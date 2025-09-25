'use client';

import React, { useState, useEffect } from 'react';
import { useData } from '@/context/data-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Users,
  Award,
  BarChart3,
  Calendar
} from 'lucide-react';

interface EmployeeRankingDisplayProps {
  period?: string;
}

export default function EmployeeRankingDisplay({ period: initialPeriod }: EmployeeRankingDisplayProps) {
  const { 
    employeeRankings, 
    performanceComparisons, 
    employees, 
    departments,
    calculateEmployeeRankings,
    calculatePerformanceComparisons,
    getTopPerformers,
    getDepartmentRankings
  } = useData();

  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod || '');
  const [isCalculating, setIsCalculating] = useState(false);

  // Generate available periods from existing data
  const availablePeriods = Array.from(
    new Set(employeeRankings.map(r => r.period))
  ).sort().reverse();

  // If no periods available, generate current month
  useEffect(() => {
    if (availablePeriods.length === 0) {
      const currentDate = new Date();
      const currentPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      setSelectedPeriod(currentPeriod);
    } else if (!selectedPeriod) {
      setSelectedPeriod(availablePeriods[0]);
    }
  }, [availablePeriods, selectedPeriod]);

  const handleCalculateRankings = async () => {
    if (!selectedPeriod) return;
    
    setIsCalculating(true);
    try {
      await calculateEmployeeRankings(selectedPeriod);
      await calculatePerformanceComparisons(selectedPeriod);
    } catch (error) {
      console.error('Error calculating rankings:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const currentRankings = employeeRankings.filter(r => r.period === selectedPeriod);
  const topPerformers = getTopPerformers(selectedPeriod, 10);
  const comparisons = performanceComparisons.filter(c => c.period === selectedPeriod);

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.uid === employeeId);
    return employee ? employee.name : 'Unknown Employee';
  };

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : 'Unknown Department';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getQuartileColor = (quartile: string) => {
    switch (quartile) {
      case 'Q1': return 'bg-yellow-100 text-yellow-800';
      case 'Q2': return 'bg-green-100 text-green-800';
      case 'Q3': return 'bg-blue-100 text-blue-800';
      case 'Q4': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <div>
            <h1 className="text-2xl font-bold">Employee Rankings</h1>
            <p className="text-gray-600">Performance rankings and comparisons</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {availablePeriods.map(period => (
                <SelectItem key={period} value={period}>
                  {period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleCalculateRankings}
            disabled={isCalculating || !selectedPeriod}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            {isCalculating ? 'Calculating...' : 'Calculate Rankings'}
          </Button>
        </div>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Top Performers - {selectedPeriod}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topPerformers.length > 0 ? (
            <div className="grid gap-4">
              {topPerformers.map((ranking, index) => (
                <div key={ranking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 font-bold">
                      {ranking.overallRank}
                    </div>
                    <div>
                      <h3 className="font-semibold">{getEmployeeName(ranking.employeeId)}</h3>
                      <p className="text-sm text-gray-600">{getDepartmentName(ranking.departmentId)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{ranking.totalScore}%</p>
                      <p className="text-sm text-gray-600">Total Score</p>
                    </div>
                    <Badge className={getQuartileColor(ranking.quartile)}>
                      {ranking.quartile}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm font-medium">{ranking.percentile}th percentile</p>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(ranking.trend)}
                        <span className="text-xs text-gray-600">{ranking.trend}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No rankings available for {selectedPeriod}</p>
              <p className="text-sm">Click "Calculate Rankings" to generate rankings</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Department Rankings */}
      <Tabs defaultValue="overall" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overall">Overall Rankings</TabsTrigger>
          <TabsTrigger value="departments">By Department</TabsTrigger>
          <TabsTrigger value="comparisons">Performance Comparisons</TabsTrigger>
        </TabsList>

        <TabsContent value="overall">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Overall Rankings - {selectedPeriod}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentRankings.length > 0 ? (
                <div className="space-y-2">
                  {currentRankings
                    .sort((a, b) => a.overallRank - b.overallRank)
                    .map(ranking => (
                      <div key={ranking.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg w-8">{ranking.overallRank}</span>
                          <div>
                            <p className="font-medium">{getEmployeeName(ranking.employeeId)}</p>
                            <p className="text-sm text-gray-600">{getDepartmentName(ranking.departmentId)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="font-semibold">{ranking.totalScore}%</p>
                            <p className="text-xs text-gray-600">Score</p>
                          </div>
                          <Badge className={getQuartileColor(ranking.quartile)}>
                            {ranking.quartile}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No overall rankings available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments">
          <div className="grid gap-4">
            {departments.map(department => {
              const deptRankings = getDepartmentRankings(department.id, selectedPeriod);
              return (
                <Card key={department.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{department.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {deptRankings.length > 0 ? (
                      <div className="space-y-2">
                        {deptRankings.map(ranking => (
                          <div key={ranking.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-3">
                              <span className="font-bold w-6">{ranking.departmentRank}</span>
                              <p className="font-medium">{getEmployeeName(ranking.employeeId)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{ranking.totalScore}%</span>
                              <Badge className={getQuartileColor(ranking.quartile)}>
                                {ranking.quartile}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No rankings for this department</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="comparisons">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Comparisons - {selectedPeriod}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {comparisons.length > 0 ? (
                <div className="space-y-4">
                  {comparisons.map(comparison => (
                    <div key={comparison.id} className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-3">{getEmployeeName(comparison.employeeId)}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600">vs Department Avg</p>
                          <p className="font-semibold">{comparison.vsDepartmentAverage.percentage}%</p>
                          <Badge variant={comparison.vsDepartmentAverage.status === 'above' ? 'default' : 'secondary'}>
                            {comparison.vsDepartmentAverage.status}
                          </Badge>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600">vs Company Avg</p>
                          <p className="font-semibold">{comparison.vsCompanyAverage.percentage}%</p>
                          <Badge variant={comparison.vsCompanyAverage.status === 'above' ? 'default' : 'secondary'}>
                            {comparison.vsCompanyAverage.status}
                          </Badge>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600">vs Top Performer</p>
                          <p className="font-semibold">{comparison.vsTopPerformer.percentage}%</p>
                          <p className="text-xs text-gray-600">Gap: {comparison.vsTopPerformer.gap}%</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600">vs Previous Period</p>
                          <p className="font-semibold">{comparison.vsPreviousPeriod.percentage}%</p>
                          <div className="flex items-center justify-center gap-1">
                            {getTrendIcon(comparison.vsPreviousPeriod.trend)}
                            <span className="text-xs">{comparison.vsPreviousPeriod.trend}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No performance comparisons available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
