
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText } from 'lucide-react';
import { ConfigItem } from '@/types/config';

interface DashboardTableProps {
  configs: ConfigItem[];
}

const DashboardTable: React.FC<DashboardTableProps> = ({ configs }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'draft': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      case 'schedule': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  // Group configs by application
  const configsByApp = configs.reduce((acc, config) => {
    if (!acc[config.application]) {
      acc[config.application] = [];
    }
    acc[config.application].push(config);
    return acc;
  }, {} as Record<string, ConfigItem[]>);

  // Calculate status counts for each app
  const getAppStatusCounts = (appConfigs: ConfigItem[]) => {
    return {
      deployed: appConfigs.filter(c => c.status === 'deployed').length,
      draft: appConfigs.filter(c => c.status === 'draft').length,
      schedule: appConfigs.filter(c => c.status === 'schedule').length,
    };
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <FileText className="h-5 w-5" />
          配置項目總覽
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(configsByApp).map(([appName, appConfigs]) => {
            const statusCounts = getAppStatusCounts(appConfigs);
            return (
              <div key={appName} className="border border-slate-600 rounded-lg p-4 bg-slate-700/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-200">{appName}</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-green-400">已部署: {statusCounts.deployed}</span>
                      <span className="text-yellow-400">排程: {statusCounts.schedule}</span>
                      <span className="text-gray-400">草稿: {statusCounts.draft}</span>
                    </div>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-slate-200 hover:bg-slate-600"
                    >
                      <Link to={`/app/${appName}`}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        管理
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  {appConfigs.map((config) => (
                    <div key={config.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded hover:bg-slate-800/70 transition-colors">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-200">{config.key}</p>
                        <p className="text-xs text-slate-400">{config.profile} • {config.label}</p>
                      </div>
                      <Badge className={getStatusColor(config.status)}>
                        {config.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {configs.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              目前沒有任何配置項目
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardTable;
