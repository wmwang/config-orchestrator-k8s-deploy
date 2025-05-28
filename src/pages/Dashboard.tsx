
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Server, Settings, Activity } from 'lucide-react';
import { ConfigItem } from '@/types/config';
import DashboardTable from '@/components/DashboardTable';
import ThemeToggle from '@/components/ThemeToggle';
import { useToast } from "@/hooks/use-toast"

const mockConfigs: ConfigItem[] = [
  {
    id: '1',
    application: 'user-service',
    profile: 'production',
    label: 'v1.2.0',
    options: '--reload',
    key: 'database.host',
    config: 'postgresql://prod-db:5432/userdb',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
    status: 'deployed'
  },
  {
    id: '2',
    application: 'api-gateway',
    profile: 'staging',
    label: 'v2.1.0',
    options: '--debug',
    key: 'redis.cache.ttl',
    config: '3600',
    createdAt: '2024-01-18T09:15:00Z',
    updatedAt: '2024-01-22T11:20:00Z',
    status: 'draft'
  },
  {
    id: '3',
    application: 'auth-service',
    profile: 'development',
    label: 'v1.0.0-beta',
    options: '--hot-reload',
    key: 'jwt.secret',
    config: 'dev-secret-key-change-in-prod',
    createdAt: '2024-01-20T16:00:00Z',
    updatedAt: '2024-01-23T08:30:00Z',
    status: 'schedule'
  }
];

const Dashboard = () => {
  const [configs, setConfigs] = useState<ConfigItem[]>(mockConfigs);
  const { toast } = useToast()

  const stats = [
    {
      title: "總配置數量",
      value: configs.length,
      icon: Database,
      color: "text-blue-400"
    },
    {
      title: "已部署",
      value: configs.filter(c => c.status === 'deployed').length,
      icon: Server,
      color: "text-green-400"
    },
    {
      title: "排程中",
      value: configs.filter(c => c.status === 'schedule').length,
      icon: Activity,
      color: "text-yellow-400"
    },
    {
      title: "草稿",
      value: configs.filter(c => c.status === 'draft').length,
      icon: Settings,
      color: "text-gray-400"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Theme Toggle - positioned at top right */}
        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            配置管理儀表板
          </h1>
          <p className="text-slate-400">
            集中管理所有應用程式的配置項目
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Config List Table */}
        <DashboardTable configs={configs} />

        {/* Footer */}
        <div className="text-center text-slate-500 mt-8">
          <p>
            由 <a href="#" className="hover:text-slate-300 underline">Your Company</a> 提供技術支援
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
