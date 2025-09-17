'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { 
  AlertCircle as AlertTriangleIcon, 
  AlertCircle, 
  Info, 
  XCircle, 
  RefreshCw, 
  Trash2,
  Filter,
  Search,
  Download
} from 'lucide-react';
import { ErrorDetails, ErrorMetrics } from '@/lib/error-tracker';
import { errorClient } from '@/lib/api/errorClient';

export default function ErrorMonitoringPage() {
  const [errors, setErrors] = useState<ErrorDetails[]>([]);
  const [metrics, setMetrics] = useState<ErrorMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch error data
  const fetchErrorData = async () => {
    try {
      setLoading(true);
      
      // Fetch from the API
      const [errorMetrics, allErrors] = await Promise.all([
        errorClient.getMetrics(),
        errorClient.getAllErrors()
      ]);
      
      setMetrics(errorMetrics);
      setErrors(allErrors);
    } catch (error) {
      console.error('Failed to fetch error data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Clear all errors
  const clearAllErrors = async () => {
    if (confirm('Are you sure you want to clear all error tracking data?')) {
      try {
        await errorClient.clearAllErrors();
        setErrors([]);
        setMetrics(null);
      } catch (error) {
        console.error('Failed to clear errors:', error);
      }
    }
  };

  // Export errors to CSV
  const exportErrors = async () => {
    try {
      const blob = await errorClient.exportErrors();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `error-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      // Safely remove the link element
      if (a.parentNode) {
        a.parentNode.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export errors:', error);
      alert('Failed to export errors. Please try again.');
    }
  };

  // Filter errors based on severity and search term
  const filteredErrors = errors.filter(error => {
    // Apply severity filter
    if (filter !== 'all' && error.severity !== filter) {
      return false;
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        error.message.toLowerCase().includes(term) ||
        error.severity.toLowerCase().includes(term) ||
        error.id.toLowerCase().includes(term)
      );
    }
    
    return true;
  });

  // Get icon for severity level
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangleIcon className="h-4 w-4 text-orange-500" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-accent" />;
      case 'low': return <Info className="h-4 w-4 text-brand-accent" />;
      default: return <AlertCircle className="h-4 w-4 text-neutral-500" />;
    }
  };

  // Get badge variant for severity
  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'outline';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  useEffect(() => {
    fetchErrorData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchErrorData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-neutral-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-h1">Error Monitoring</h1>
          <p className="text-neutral-500">Track and analyze application errors</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button onClick={fetchErrorData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportErrors} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={clearAllErrors} 
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-50 hover:border-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-body-sm font-medium">Total Errors</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-h2">{metrics.total.toLocaleString()}</div>
              <p className="text-caption text-muted-foreground">Unresolved: {metrics.unresolved} errors</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-body-sm font-medium">Critical</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-h2">
                {metrics.bySeverity.critical?.toLocaleString() || '0'}
              </div>
              <p className="text-caption text-muted-foreground">Requires immediate attention</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-body-sm font-medium">High</CardTitle>
              <AlertTriangleIcon className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-h2">
                {metrics.bySeverity.high?.toLocaleString() || '0'}
              </div>
              <p className="text-caption text-muted-foreground">Needs prompt resolution</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-body-sm font-medium">Medium</CardTitle>
              <AlertCircle className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-h2">
                {metrics.bySeverity.medium?.toLocaleString() || '0'}
              </div>
              <p className="text-caption text-muted-foreground">Should be addressed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-body-sm font-medium">Low</CardTitle>
              <Info className="h-4 w-4 text-brand-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-h2">
                {metrics.bySeverity.low?.toLocaleString() || '0'}
              </div>
              <p className="text-caption text-muted-foreground">Informational</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Errors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search errors by message, type, or ID..."
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={filter === 'all' ? 'primary' : 'outline'} 
                onClick={() => setFilter('all')}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                All
              </Button>
              <Button 
                variant={filter === 'critical' ? 'outline' : 'outline'} 
                onClick={() => setFilter('critical')}
                className={filter === 'critical' ? 'border-red-500 text-red-500 hover:bg-red-50 hover:border-red-600' : ''}
              >
                Critical
              </Button>
              <Button 
                variant={filter === 'high' ? 'outline' : 'outline'} 
                onClick={() => setFilter('high')}
                className={filter === 'high' ? 'border-red-500 text-red-500 hover:bg-red-50 hover:border-red-600' : ''}
              >
                High
              </Button>
              <Button 
                variant={filter === 'medium' ? 'primary' : 'outline'} 
                onClick={() => setFilter('medium')}
              >
                Medium
              </Button>
              <Button 
                variant={filter === 'low' ? 'outline' : 'outline'} 
                onClick={() => setFilter('low')}
                className={filter === 'low' ? 'border-brand-accent text-brand-accent hover:bg-blue-50 hover:border-brand-accent-light' : ''}
              >
                Low
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Errors</CardTitle>
          <CardDescription>
            {filteredErrors.length} error{filteredErrors.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredErrors.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-neutral-400" />
              <h3 className="mt-2 text-body-sm font-medium text-neutral-900">No errors found</h3>
              <p className="mt-1 text-body-sm text-neutral-500">
                {searchTerm || filter !== 'all' 
                  ? 'No errors match your current filters.' 
                  : 'No errors have been tracked yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredErrors.map((error) => (
                <div key={error.id} className="border rounded-lg p-4 hover:bg-neutral-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(error.severity)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{error.type}</h3>
                          <Badge variant={getSeverityVariant(error.severity)}>
                            {error.severity}
                          </Badge>
                          <Badge variant="secondary">
                            {error.category}
                          </Badge>
                        </div>
                        <p className="text-body-sm text-neutral-600 mt-1">{error.message}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-caption text-neutral-500">
                            First: {error.firstOccurred ? new Date(error.firstOccurred).toLocaleString() : 'N/A'}
                          </span>
                          <span className="text-caption text-neutral-500">
                            Last: {error.lastOccurred ? new Date(error.lastOccurred).toLocaleString() : 'N/A'}
                          </span>
                          <span className="text-caption text-neutral-500">
                            Count: {error.count}
                          </span>
                          <span className="text-caption text-neutral-500">
                            ID: {error.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {error.context?.url && (
                    <div className="mt-2 text-caption text-neutral-500">
                      URL: {error.context.url}
                    </div>
                  )}
                  
                  {error.metadata && Object.keys(error.metadata).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-caption text-neutral-500 cursor-pointer">
                        Metadata ({Object.keys(error.metadata).length} items)
                      </summary>
                      <pre className="mt-2 text-caption bg-neutral-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(error.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}