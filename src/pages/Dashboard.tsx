import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Server, Database, Settings, Activity, ArrowRight } from 'lucide-react';
import { ConfigItem } from '@/types/config';
import ThemeToggle from '@/components/ThemeToggle';

// 模擬數據 - 實際應用中這些數據會從API獲取
const mockConfigs: ConfigItem[] = [{
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
}, {
  id: '2',
  application: 'api-gateway',
  profile: 'staging',
  label: 'v2.1.0',
  options: '--debug',
  key: 'redis.cache.ttl',
  config: '3600',
  createdAt: '2024-01-18T09:15:00Z',
  updatedAt: '2024-01-22T11:20:00Z',
  status: 'active'
}, {
  id: '3',
  application: 'auth-service',
  profile: 'development',
  label: 'v1.0.0-beta',
  options: '--hot-reload',
  key: 'jwt.secret',
  config: 'dev-secret-key-change-in-prod',
  createdAt: '2024-01-20T16:00:00Z',
  updatedAt: '2024-01-23T08:30:00Z',
  status: 'pending'
}];
const Dashboard = () => {
  // 統計各應用程式的配置數量
  const applicationStats = mockConfigs.reduce((acc, config) => {
    if (!acc[config.application]) {
      acc[config.application] = {
        total: 0,
        deployed: 0,
        pending: 0,
        active: 0
      };
    }
    acc[config.application].total++;
    acc[config.application][config.status]++;
    return acc;
  }, {} as Record<string, {
    total: number;
    deployed: number;
    pending: number;
    active: number;
  }>);
  const totalStats = {
    applications: Object.keys(applicationStats).length,
    totalConfigs: mockConfigs.length,
    deployed: mockConfigs.filter(c => c.status === 'deployed').length,
    pending: mockConfigs.filter(c => c.status === 'pending').length,
    active: mockConfigs.filter(c => c.status === 'active').length
  };
  const overallStats = [{
    title: "應用程式數量",
    value: totalStats.applications,
    icon: Server,
    color: "text-blue-400"
  }, {
    title: "總配置數量",
    value: totalStats.totalConfigs,
    icon: Database,
    color: "text-purple-400"
  }, {
    title: "已部署",
    value: totalStats.deployed,
    icon: Settings,
    color: "text-green-400"
  }, {
    title: "待處理",
    value: totalStats.pending,
    icon: Activity,
    color: "text-yellow-400"
  }];
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 bg-stone-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* 頁面標題 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 dark:text-slate-100 text-slate-900 mb-2">
              配置管理儀表板
            </h1>
            <p className="text-slate-400 dark:text-slate-400 text-slate-600">
              統一管理所有應用程式配置，支援 K8s 集群部署
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* 總體統計 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {overallStats.map((stat, index) => <Card key={index} className="bg-slate-800/50 border-slate-700 dark:bg-slate-800/50 dark:border-slate-700 bg-white border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 dark:text-slate-400 text-slate-600 text-sm font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-100 dark:text-slate-100 text-slate-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>)}
        </div>

        {/* 應用程式列表 */}
        <Card className="bg-slate-800/50 border-slate-700 dark:bg-slate-800/50 dark:border-slate-700 bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-100 dark:text-slate-100 text-slate-900 flex items-center gap-2">
              <Server className="h-5 w-5" />
              應用程式列表
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(applicationStats).map(([appName, stats]) => <Card key={appName} className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 dark:bg-slate-700/50 dark:border-slate-600 dark:hover:bg-slate-700/70 bg-slate-50 border-slate-200 hover:bg-slate-100 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-slate-100 dark:text-slate-100 text-slate-900">{appName}</h3>
                      <Button asChild variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-500/20 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <Link to={`/app/${appName}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400 dark:text-slate-400 text-slate-600">總配置:</span>
                        <span className="text-slate-200 dark:text-slate-200 text-slate-800 font-medium">{stats.total}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400 dark:text-slate-400 text-slate-600">已部署:</span>
                        <span className="text-green-400 font-medium">{stats.deployed}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400 dark:text-slate-400 text-slate-600">待處理:</span>
                        <span className="text-yellow-400 font-medium">{stats.pending}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400 dark:text-slate-400 text-slate-600">啟用中:</span>
                        <span className="text-purple-400 font-medium">{stats.active}</span>
                      </div>
                    </div>

                    <Button asChild className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                      <Link to={`/app/${appName}`}>
                        管理配置
                      </Link>
                    </Button>
                  </CardContent>
                </Card>)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Dashboard;