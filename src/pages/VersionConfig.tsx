import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; // Import CardFooter
import { Plus, ArrowLeft, Server, Database, Settings, Activity, Copy } from 'lucide-react'; // Import Copy icon
import { useToast } from '@/hooks/use-toast';
import VersionTable from '@/components/VersionTable';
import ConfigDialog from '@/components/ConfigDialog';
import DeploymentDialog from '@/components/DeploymentDialog';
import { ConfigItem, DeploymentOption } from '@/types/config';

// 假設 ConfigItem 型別已包含 `label?: string[]`
const API_BASE_URL = 'http://localhost:3000';

const ApplicationConfig = () => {
  const { appName } = useParams<{ appName: string }>();
  const { toast } = useToast();
  
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPromoting, setIsPromoting] = useState(false); // State for button loading
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
  }, [fetchConfigs]);

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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedConfig),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        await fetchConfigs(); // Refetch to ensure data consistency
        toast({ title: "配置更新成功", description: `已更新配置項目: ${configData.key}` });
      } else {
        // 新增配置
        const newConfig: ConfigItem = {
          ...configData,
          application: appName || '',
          id: Date.now().toString(),
          createdAt: now,
          updatedAt: now,
        };
        const response = await fetch(`${API_BASE_URL}/configs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newConfig),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        await fetchConfigs(); // Refetch to get the latest list including the new item
        toast({ title: "配置新增成功", description: `已新增配置項目: ${configData.key}` });
      }
    } catch (error) {
      console.error("Failed to save config:", error);
      toast({ title: "錯誤", description: "無法保存配置。", variant: "destructive" });
    }
  };

  const handleDeleteConfig = async (id: string) => {
   try {
     const config = configs.find(c => c.id === id);
      if (!window.confirm(`確定要刪除配置項目 "${config?.key}" 嗎？`)) return;
      
     const response = await fetch(`${API_BASE_URL}/configs/${id}`, { method: 'DELETE' });
     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
     
     setConfigs(prev => prev.filter(config => config.id !== id));
     toast({ title: "配置刪除成功", description: `已刪除配置項目: ${config?.key}`, variant: "destructive" });
   } catch (error) {
    console.error("Failed to delete config:", error);
    toast({ title: "錯誤", description: "無法刪除配置項目。", variant: "destructive" });
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
          ? { ...config, status: deploymentOption.type === 'immediate' ? 'deployed' : 'pending' }
          : config
      ));

      const deploymentMessage = deploymentOption.type === 'immediate' 
        ? `立即部署到 ${deploymentOption.targetClusters.length} 個集群`
        : `已排程於 ${deploymentOption.scheduledTime} 部署到 ${deploymentOption.targetClusters.length} 個集群`;

      toast({ title: "部署設定完成", description: deploymentMessage });
    }
  };

  // --- NEW: Function to copy 'latest' configs to 'candidate' ---
  const handlePromoteToCandidate = async () => {
    const latestConfigsToCopy = configs.filter(c => c.label?.includes('latest'));
    const existingCandidateConfigs = configs.filter(c => c.label?.includes('candidate'));

    if (latestConfigsToCopy.length === 0) {
      toast({ description: "沒有標記為 'latest' 的配置可供複製。" });
      return;
    }

    // More explicit confirmation dialog
    const confirmationMessage = `您確定要升級嗎？\n\n這將會：\n1. 刪除所有 ${existingCandidateConfigs.length} 個現有的 'candidate' 配置。\n2. 根據目前的 'latest' 配置，重新創建 ${latestConfigsToCopy.length} 個新的 'candidate' 配置。`;
    
    if (!window.confirm(confirmationMessage)) {
      return;
    }
    
    setIsPromoting(true);

    try {
      // Step 1: Delete all existing 'candidate' configurations
      if (existingCandidateConfigs.length > 0) {
        const deletePromises = existingCandidateConfigs.map(config =>
          fetch(`${API_BASE_URL}/configs/${config.id}`, { 
            method: 'DELETE' 
          }).then(res => {
            if (!res.ok) throw new Error(`Failed to delete candidate config: ${config.key}`);
          })
        );
        await Promise.all(deletePromises);
        toast({ 
          title: "舊版 Candidate 已清除", 
          description: `已刪除 ${existingCandidateConfigs.length} 個配置。` 
        });
      }

      // Step 2: Create new 'candidate' configurations from 'latest'
      const newCandidateConfigs = latestConfigsToCopy.map(config => {
        const { id, createdAt, updatedAt, label, ...rest } = config;
        return {
          ...rest,
          label: ['candidate'],
          status: 'active',
        };
      });

      const createPromises = newCandidateConfigs.map(newConfig =>
        fetch(`${API_BASE_URL}/configs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newConfig),
        }).then(res => {
          if (!res.ok) throw new Error(`Failed to create new candidate config for key: ${newConfig.key}`);
          return res.json();
        })
      );

      await Promise.all(createPromises);

      toast({
        title: "升級成功",
        description: `已成功將 'latest' 配置複製為新的 'candidate' 配置。`,
      });

    } catch (error) {
      console.error("Failed to promote configs to candidate:", error);
      toast({
        title: "升級失敗",
        description: error instanceof Error ? error.message : "發生未知錯誤，請檢查控制台。",
        variant: "destructive",
      });
    } finally {
      // Step 3: Always refresh data to reflect the final state
      setIsPromoting(false);
      await fetchConfigs();
    }
  };

  const stats = [
    { title: "總配置數量", value: configs.length, icon: Database, color: "text-blue-400" },
    { title: "已部署", value: configs.filter(c => c.status === 'deployed').length, icon: Server, color: "text-green-400" },
    { title: "待處理", value: configs.filter(c => c.status === 'pending').length, icon: Activity, color: "text-yellow-400" },
    { title: "啟用中", value: configs.filter(c => c.status === 'active').length, icon: Settings, color: "text-purple-400" }
  ];

  const latestConfigs = configs.filter(config => config.label?.includes('latest'));
  const candidateConfigs = configs.filter(config => config.label?.includes('candidate'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* 導航和標題 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 hover:bg-slate-700">
              <Link to={`/app/${appName}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回配置管理
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">{appName} 配置管理</h1>
              <p className="text-slate-400">管理 {appName} 應用程式的所有配置項目</p>
            </div>
          </div>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Two-column layout for config tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Latest */}
          <Card className="bg-white border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 flex flex-col">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Latest</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <VersionTable
                configs={latestConfigs}
                onEdit={handleEditConfig}
                onDelete={handleDeleteConfig}
                onDeploy={handleDeployConfig}
              />
            </CardContent>
            {/* --- NEW: Button added to the footer --- */}
            <CardFooter>
              <Button 
                onClick={handlePromoteToCandidate} 
                disabled={isPromoting || latestConfigs.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Copy className="h-4 w-4 mr-2" />
                {isPromoting ? '複製中...' : '一鍵複製為 Candidate'}
              </Button>
            </CardFooter>
          </Card>

          {/* Right Column: Candidate */}
          <Card className="bg-white border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Candidate</CardTitle>
            </CardHeader>
            <CardContent>
              <VersionTable
                configs={candidateConfigs}
                onEdit={handleEditConfig}
                onDelete={handleDeleteConfig}
                onDeploy={handleDeployConfig}
              />
            </CardContent>
          </Card>
        </div>

        {/* Dialogs */}
        <ConfigDialog
          open={configDialogOpen}
          onOpenChange={setConfigDialogOpen}
          config={selectedConfig}
          onSave={handleSaveConfig}
        />
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