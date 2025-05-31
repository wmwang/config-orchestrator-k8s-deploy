
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ArrowLeft, Server, Database, Settings, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ConfigTable from '@/components/ConfigTable';
import ConfigDialog from '@/components/ConfigDialog';
import DeploymentDialog from '@/components/DeploymentDialog';
import { ConfigItem, DeploymentOption } from '@/types/config';
const API_BASE_URL = 'http://localhost:3000';

const ApplicationConfig = () => {
  const { appName } = useParams<{ appName: string }>();
  const { toast } = useToast();
  
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [deploymentDialogOpen, setDeploymentDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<ConfigItem | null>(null);

  const fetchConfigs = useCallback(async () => {
    if (!appName) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/configs?application=${appName}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setConfigs(data);
    } catch (error) {
      console.error("Failed to fetch configs:", error);
      toast({
        title: "錯誤",
        description: "無法載入應用程式配置。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [appName, toast]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]); // Depend on the memoized fetchConfigs

  const handleAddConfig = () => {
    setSelectedConfig(null);
    setConfigDialogOpen(true);
  };

  const handleEditConfig = (config: ConfigItem) => {
    setSelectedConfig(config);
    setConfigDialogOpen(true);
  };

  const handleSaveConfig = async (configData: Omit<ConfigItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    
    try {
      if (selectedConfig) {
        // 更新現有配置
        const updatedConfig: ConfigItem = {
          ...selectedConfig,
          ...configData,
          updatedAt: now,
        };
        const response = await fetch(`${API_BASE_URL}/configs/${selectedConfig.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedConfig),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // 更新前端狀態
        setConfigs(prev => prev.map(config => 
          config.id === selectedConfig.id 
            ? updatedConfig
            : config
        ));
        toast({
          title: "配置更新成功",
          description: `已更新配置項目: ${configData.key}`,
        });
      } else {
        // 新增配置
        const newConfig: ConfigItem = {
          ...configData,
          application: appName || '',
          id: Date.now().toString(), // 注意：JSON Server 可能會生成自己的 ID
          createdAt: now,
          updatedAt: now,
        };
        const response = await fetch(`${API_BASE_URL}/configs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newConfig),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const savedConfig = await response.json();
        // 更新前端狀態
        setConfigs(prev => [...prev, savedConfig]);
        toast({
          title: "配置新增成功",
          description: `已新增配置項目: ${configData.key}`,
        });
      }
    } catch (error) {
      console.error("Failed to save config:", error);
      toast({
        title: "錯誤",
        description: "無法保存配置。",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfig = async (id: string) => {
   try {
     // 先找到要刪除的配置項目（用於顯示提示訊息）
     const config = configs.find(c => c.id === id);
  
     // 可以加入確認對話框
      if (!window.confirm(`確定要刪除配置項目 "${config?.key}" 嗎？`)) {
        return;
      }

     // 發送 DELETE 請求到後端
     const response = await fetch(`${API_BASE_URL}/configs/${id}`, {
       method: 'DELETE',
     });
     
     if (!response.ok) {
       throw new Error(`HTTP error! status: ${response.status}`);
     }
     
     // 後端刪除成功後，更新前端狀態
     setConfigs(prev => prev.filter(config => config.id !== id));
     
     // 顯示成功提示
     toast({
       title: "配置刪除成功",
       description: `已刪除配置項目: ${config?.key}`,
       variant: "destructive",
     });
    
   } catch (error) {
    console.error("Failed to delete config:", error);
    toast({
      title: "錯誤",
      description: "無法刪除配置項目。",
      variant: "destructive",
    });
    
   }
  };

  const handleDeployConfig = (config: ConfigItem) => {
    setSelectedConfig(config);
    setDeploymentDialogOpen(true);
  };

  const handleDeploy = (deploymentOption: DeploymentOption) => {
    if (selectedConfig) {
      setConfigs(prev => prev.map(config => 
        config.id === selectedConfig.id 
          ? { ...config, status: deploymentOption.type === 'immediate' ? 'enable' : 'disable' }
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
      value: configs.filter(c => c.status === 'enable').length,
      icon: Server,
      color: "text-green-400"
    },
    {
      title: "待處理",
      value: configs.filter(c => c.status === 'disable').length,
      icon: Activity,
      color: "text-yellow-400"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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
          <div className="flex items-center gap-x-2">
          <Button
            onClick={handleAddConfig}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            新增配置
          </Button>
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Link to={`/Version/${appName}`}>
              藍綠部署版本管理
            </Link>
          </Button>
          </div>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
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
