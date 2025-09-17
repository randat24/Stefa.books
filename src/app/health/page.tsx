'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Mock health check data - in a real app, this would come from your API
const mockHealthData = {
  status: 'healthy',
  timestamp: new Date().toISOString(),
  services: [
    { name: 'Database', status: 'healthy', responseTime: 42 },
    { name: 'API', status: 'healthy', responseTime: 18 },
    { name: 'Cache', status: 'healthy', responseTime: 5 },
    { name: 'Email Service', status: 'healthy', responseTime: 12 },
    { name: 'Storage', status: 'degraded', responseTime: 124 },
  ],
  system: {
    cpu: 42,
    memory: 68,
    disk: 24 }
};

export default function HealthPage() {
  const [healthData, setHealthData] = useState(mockHealthData);
  const [loading, setLoading] = useState(false);

  const refreshHealth = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setHealthData({
      ...mockHealthData,
      timestamp: new Date().toISOString() });
    setLoading(false);
  };

  useEffect(() => {
    // Refresh health data every 30 seconds
    const interval = setInterval(refreshHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'degraded':
        return 'text-accent-dark';
      case 'unhealthy':
        return 'text-red-600';
      default:
        return 'text-neutral-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-2xl text-caption font-medium bg-green-100 text-green-800">
          Healthy
        </span>;
      case 'degraded':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-2xl text-caption font-medium bg-yellow-100 text-yellow-800">
          Degraded
        </span>;
      case 'unhealthy':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-2xl text-caption font-medium bg-red-100 text-red-800">
          Unhealthy
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-2xl text-caption font-medium bg-neutral-100 text-neutral-800">
          Unknown
        </span>;
    }
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-h1">System Health</h1>
          <p className="text-neutral-500">Monitor the status of all system services</p>
        </div>
        <Button onClick={refreshHealth} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Status'}
        </Button>
      </div>
      
      {/* Overall Status */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Overall System Status</CardTitle>
              <CardDescription>
                Current status of all system components
              </CardDescription>
            </div>
            <div className="mt-4 md:mt-0">
              {getStatusBadge(healthData.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-body-sm text-neutral-500">
            Last updated: {new Date(healthData.timestamp).toLocaleString()}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Services Status */}
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
            <CardDescription>
              Status of individual system services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthData.services.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{service.name}</div>
                    <div className="text-body-sm text-neutral-500">Response time: {service.responseTime}ms</div>
                  </div>
                  <div className={getStatusColor(service.status)}>
                    {getStatusBadge(service.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* System Resources */}
        <Card>
          <CardHeader>
            <CardTitle>System Resources</CardTitle>
            <CardDescription>
              Current resource utilization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-body-sm font-medium">CPU Usage</span>
                  <span className="text-body-sm font-medium">{healthData.system.cpu}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-2xl h-2">
                  <div 
                    className="bg-brand-accent-light h-2 rounded-2xl" 
                    style={{ width: `${healthData.system.cpu}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-body-sm font-medium">Memory Usage</span>
                  <span className="text-body-sm font-medium">{healthData.system.memory}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-2xl h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-2xl" 
                    style={{ width: `${healthData.system.memory}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-body-sm font-medium">Disk Usage</span>
                  <span className="text-body-sm font-medium">{healthData.system.disk}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-2xl h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-2xl" 
                    style={{ width: `${healthData.system.disk}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}