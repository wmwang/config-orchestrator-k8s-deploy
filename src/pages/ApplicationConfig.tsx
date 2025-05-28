import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ArrowLeft, Server, Database, Settings, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ConfigTable from '@/components/ConfigTable';
import ConfigDialog from '@/components/ConfigDialog';
import DeploymentDialog from '@/components/DeploymentDialog';
import { ConfigItem, DeploymentOption } from '@/types/config';

// 模擬數據 - 實際應用中這些數據會從API獲取
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

const ApplicationConfig = () => {
  const { appName } = useParams<{ appName: string }>();
  const { toast } = useToast();
  
  const [configs, setConfigs] = useState<ConfigItem[]>(
    mockConfigs.filter(config => config.application === appName)
  );
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [deploymentDialogOpen, setDeploymentDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<ConfigItem | null>(null);

  const handleAddConfig = () => {
    setSelectedConfig(null);
    setConfigDialogOpen(true);
  };

  const handleEditConfig = (config: ConfigItem) => {
    setSelectedConfig(config);
    setConfigDialogOpen(true);
  };

  const handleSaveConfig = (configData: Omit<ConfigItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    
    if (selectedConfig) {
      setConfigs(prev => prev.map(config => 
        config.id === selectedConfig.id 
          ? { ...config, ...configData, updatedAt: now }
          : config
      ));
      toast({
        title: "配置更新成功",
        description: `已更新配置項目: ${configData.key}`,
      });
    } else {
      const newConfig: ConfigItem = {
        ...configData,
        application: appName || '',
        id: Date.now().toString(),
        createdAt: now,
        updatedAt: now
      };
      setConfigs(prev => [...prev, newConfig]);
      toast({
        title: "配置新增成功",
        description: `已新增配置項目: ${configData.key}`,
      });
    }
  };

  const handleDeleteConfig = (id: string) => {
    const config = configs.find(c => c.id === id);
    setConfigs(prev => prev.filter(config => config.id !== id));
    toast({
      title: "配置刪除成功",
      description: `已刪除配置項目: ${config?.key}`,
      variant: "destructive",
    });
  };

  const handleDeployConfig = (config: ConfigItem) => {
    setSelectedConfig(config);
    setDeploymentDialogOpen(true);
  };

  const handleDeploy = (deploymentOption: DeploymentOption) => {
    if (selectedConfig) {
      setConfigs(prev => prev.map(config => 
        config.id === selectedConfig.id 
          ? { ...config, status: deploymentOption.type === 'immediate' ? 'deployed' : 'schedule' as 'deployed' | 'draft' | 'schedule' }
          : config
      ));

      const deploymentMessage = deploymentOption.type === 'immediate' 
        ? `立即部署到 ${deploymentOption.targetClusters.length} 個集群`
        : `已排程於 ${deploymentOption.scheduledTime} 部署到 ${deploymentOption.targetClusters.length} 個集群`;

      toast({
        title: "部署設定完成",
        description: deploymentMessage,
      });
    }
  };

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
        {/* 導航和標題 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-700"
            >
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回儀表板
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-100 mb-2">
                {appName} 配置管理
              </h1>
              <p className="text-slate-400">
                管理 {appName} 應用程式的所有配置項目
              </p>
            </div>
          </div>
          <Button
            onClick={handleAddConfig}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            新增配置
          </Button>
        </div>

        {/* 統計卡片 */}
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

        {/* 配置表格 */}
        <ConfigTable
          configs={configs}
          onEdit={handleEditConfig}
          onDelete={handleDeleteConfig}
          onDeploy={handleDeployConfig}
        />

        {/* 配置編輯對話框 */}
        <ConfigDialog
          open={configDialogOpen}
          onOpenChange={setConfigDialogOpen}
          config={selectedConfig}
          onSave={handleSaveConfig}
        />

        {/* 部署對話框 */}
        <DeploymentDialog
          open={deploymentDialogOpen}
          onOpenChange={setDeploymentDialogOpen}
          config={selectedConfig}
          onDeploy={handleDeploy}
        />
      </div>
    </div>
  );
};

export default ApplicationConfig;
