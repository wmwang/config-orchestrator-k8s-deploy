import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Plus, ArrowLeft, Server, Database, Settings, Activity, Copy, ArrowUp, ArrowRight } from 'lucide-react'; // Import ArrowUp icon
import { useToast } from '@/hooks/use-toast';
import VersionTable from '@/components/VersionTable';
import ConfigDialog from '@/components/ConfigDialog';
import DeploymentDialog from '@/components/DeploymentDialog';
import { ConfigItem, DeploymentOption } from '@/types/config';

const API_BASE_URL = 'http://localhost:3000';

const ApplicationConfig = () => {
  const { appName } = useParams<{ appName: string }>();
  const { toast } = useToast();
  
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPromotingToCandidate, setIsPromotingToCandidate] = useState(false); // Renamed for clarity
  const [isPromotingToLatest, setIsPromotingToLatest] = useState(false); // State for the new button
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
        // Update existing config
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
        
        await fetchConfigs();
        toast({ title: "配置更新成功", description: `已更新配置項目: ${configData.key}` });
      } else {
        // Add new config
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

        await fetchConfigs();
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

  const handlePromoteToCandidate = async () => {
    const latestConfigsToCopy = configs.filter(c => c.label?.includes('latest'));
    const existingCandidateConfigs = configs.filter(c => c.label?.includes('candidate'));

    if (latestConfigsToCopy.length === 0) {
      toast({ description: "沒有標記為 'latest' 的配置可供複製。" });
      return;
    }

    const confirmationMessage = `您確定要升級為 Candidate 嗎？\n\n這將會：\n1. 刪除所有 ${existingCandidateConfigs.length} 個現有的 'candidate' 配置。\n2. 根據目前的 'latest' 配置，重新創建 ${latestConfigsToCopy.length} 個新的 'candidate' 配置。`;
    
    if (!window.confirm(confirmationMessage)) return;
    
    setIsPromotingToCandidate(true);
    try {
      if (existingCandidateConfigs.length > 0) {
        await Promise.all(existingCandidateConfigs.map(config =>
          fetch(`${API_BASE_URL}/configs/${config.id}`, { method: 'DELETE' })
            .then(res => { if (!res.ok) throw new Error(`Failed to delete candidate config: ${config.key}`); })
        ));
      }

      const newCandidateConfigs = latestConfigsToCopy.map(config => {
        const { id, createdAt, updatedAt, label, ...rest } = config;
        return { ...rest, label: ['candidate'], status: 'active' };
      });

      await Promise.all(newCandidateConfigs.map(newConfig =>
        fetch(`${API_BASE_URL}/configs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newConfig),
        }).then(res => { if (!res.ok) throw new Error(`Failed to create new candidate config for key: ${newConfig.key}`); })
      ));

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
      setIsPromotingToCandidate(false);
      await fetchConfigs();
    }
  };

  // --- NEW: Function to promote 'candidate' configs to 'latest' ---
  const handlePromoteToLatest = async () => {
    const candidateConfigsToCopy = configs.filter(c => c.label?.includes('candidate'));
    const existingLatestConfigs = configs.filter(c => c.label?.includes('latest'));

    if (candidateConfigsToCopy.length === 0) {
      toast({ description: "沒有標記為 'candidate' 的配置可供提升。" });
      return;
    }
    
    const confirmationMessage = `您確定要提升為 Latest 嗎？\n\n這將會：\n1. 刪除所有 ${existingLatestConfigs.length} 個現有的 'latest' 配置。\n2. 根據目前的 'candidate' 配置，重新創建 ${candidateConfigsToCopy.length} 個新的 'latest' 配置。`;

    if (!window.confirm(confirmationMessage)) return;

    setIsPromotingToLatest(true);
    try {
      // Step 1: Delete all existing 'latest' configurations
      if (existingLatestConfigs.length > 0) {
        await Promise.all(existingLatestConfigs.map(config =>
          fetch(`${API_BASE_URL}/configs/${config.id}`, { method: 'DELETE' })
            .then(res => { if (!res.ok) throw new Error(`Failed to delete latest config: ${config.key}`); })
        ));
      }

      // Step 2: Create new 'latest' configurations from 'candidate'
      const newLatestConfigs = candidateConfigsToCopy.map(config => {
        const { id, createdAt, updatedAt, label, ...rest } = config;
        return { ...rest, label: ['latest'], status: 'active' }; // Change label to 'latest'
      });
      
      await Promise.all(newLatestConfigs.map(newConfig =>
        fetch(`${API_BASE_URL}/configs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newConfig),
        }).then(res => { if (!res.ok) throw new Error(`Failed to create new latest config for key: ${newConfig.key}`); })
      ));

      toast({
        title: "提升成功",
        description: `已成功將 'candidate' 配置提升為 'latest'。`,
      });

    } catch (error) {
      console.error("Failed to promote configs to latest:", error);
      toast({
        title: "提升失敗",
        description: error instanceof Error ? error.message : "發生未知錯誤，請檢查控制台。",
        variant: "destructive",
      });
    } finally {
      setIsPromotingToLatest(false);
      await fetchConfigs(); // Always refresh data
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
  const isPromoting = isPromotingToCandidate || isPromotingToLatest;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-6 space-y-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <CardFooter>
              <Button 
                onClick={handlePromoteToCandidate} 
                disabled={isPromoting || latestConfigs.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Copy className="h-4 w-4 mr-2" />
                {isPromotingToCandidate ? '複製中...' : '1. 一鍵產生Candidate'}
              </Button>
              <ArrowRight className="h-8 w-8 ml-4" />
            </CardFooter>
          </Card>

          <Card className="bg-white border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 flex flex-col">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Candidate</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <VersionTable
                configs={candidateConfigs}
                onEdit={handleEditConfig}
                onDelete={handleDeleteConfig}
                onDeploy={handleDeployConfig}
              />
            </CardContent>
            {/* --- NEW: Button added to the Candidate Card footer --- */}
            <CardFooter>
            <ArrowLeft className="h-8 w-8 mr-4" />
              <Button
                onClick={handlePromoteToLatest}
                disabled={isPromoting || candidateConfigs.length === 0}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Copy className="h-4 w-4 mr-2" />
                {isPromotingToLatest ? '提升中...' : '2. 藍綠驗證完成，一鍵提升為 Latest'}
              </Button>
            </CardFooter>
          </Card>
        </div>

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