
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Server, Zap } from 'lucide-react';
import { ConfigItem, DeploymentOption, K8sCluster } from '@/types/config';

interface DeploymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ConfigItem | null;
  onDeploy: (deploymentOption: DeploymentOption) => void;
}

const DeploymentDialog: React.FC<DeploymentDialogProps> = ({ open, onOpenChange, config, onDeploy }) => {
  const [deploymentType, setDeploymentType] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledTime, setScheduledTime] = useState('');
  const [selectedClusters, setSelectedClusters] = useState<string[]>([]);
  const [environment, setEnvironment] = useState('');

  // 模擬 K8s 集群資料
  const clusters: K8sCluster[] = [
    { id: 'k8s-dev-1', name: 'Development Cluster 1', environment: 'dev', status: 'online' },
    { id: 'k8s-dev-2', name: 'Development Cluster 2', environment: 'dev', status: 'online' },
    { id: 'k8s-staging-1', name: 'Staging Cluster', environment: 'staging', status: 'online' },
    { id: 'k8s-prod-1', name: 'Production Cluster 1', environment: 'production', status: 'online' },
    { id: 'k8s-prod-2', name: 'Production Cluster 2', environment: 'production', status: 'offline' }
  ];

  const handleClusterToggle = (clusterId: string) => {
    setSelectedClusters(prev => 
      prev.includes(clusterId) 
        ? prev.filter(id => id !== clusterId)
        : [...prev, clusterId]
    );
  };

  const handleDeploy = () => {
    const deploymentOption: DeploymentOption = {
      type: deploymentType,
      scheduledTime: deploymentType === 'scheduled' ? scheduledTime : undefined,
      targetClusters: selectedClusters,
      environment
    };
    onDeploy(deploymentOption);
    onOpenChange(false);
    // 重置表單
    setDeploymentType('immediate');
    setScheduledTime('');
    setSelectedClusters([]);
    setEnvironment('');
  };

  const getClusterStatusColor = (status: string) => {
    return status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400';
  };

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'dev': return 'bg-blue-500/20 text-blue-400';
      case 'staging': return 'bg-yellow-500/20 text-yellow-400';
      case 'production': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-slate-100 max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Server className="h-5 w-5" />
            部署配置到 K8s 集群
          </DialogTitle>
        </DialogHeader>

        {config && (
          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-200">配置預覽</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-400">應用程式:</span> <span className="text-slate-200">{config.application}</span></div>
                <div><span className="text-slate-400">環境:</span> <span className="text-slate-200">{config.profile}</span></div>
                <div><span className="text-slate-400">鍵值:</span> <span className="text-slate-200 font-mono">{config.key}</span></div>
                <div><span className="text-slate-400">標籤:</span> <span className="text-slate-200">{config.label}</span></div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {/* 部署類型選擇 */}
          <div className="space-y-3">
            <Label className="text-slate-300 text-base">部署類型</Label>
            <div className="grid grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer transition-all ${
                  deploymentType === 'immediate' 
                    ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/50' 
                    : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                }`}
                onClick={() => setDeploymentType('immediate')}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <Zap className="h-5 w-5 text-blue-400" />
                  <div>
                    <div className="font-medium text-slate-200">立即部署</div>
                    <div className="text-sm text-slate-400">配置將立即推送到選定的集群</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all ${
                  deploymentType === 'scheduled' 
                    ? 'bg-purple-600/20 border-purple-500 ring-2 ring-purple-500/50' 
                    : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                }`}
                onClick={() => setDeploymentType('scheduled')}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-purple-400" />
                  <div>
                    <div className="font-medium text-slate-200">排程部署</div>
                    <div className="text-sm text-slate-400">設定特定時間進行部署</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 排程時間設定 */}
          {deploymentType === 'scheduled' && (
            <div className="space-y-2">
              <Label htmlFor="scheduledTime" className="text-slate-300 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                排程時間
              </Label>
              <Input
                id="scheduledTime"
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-100"
                required={deploymentType === 'scheduled'}
              />
            </div>
          )}

          {/* 環境選擇 */}
          <div className="space-y-2">
            <Label className="text-slate-300">目標環境</Label>
            <Select value={environment} onValueChange={setEnvironment}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                <SelectValue placeholder="選擇部署環境" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="dev">開發環境</SelectItem>
                <SelectItem value="staging">測試環境</SelectItem>
                <SelectItem value="production">生產環境</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* K8s 集群選擇 */}
          <div className="space-y-3">
            <Label className="text-slate-300">選擇 K8s 集群</Label>
            <div className="grid gap-3">
              {clusters.map((cluster) => (
                <Card 
                  key={cluster.id} 
                  className={`cursor-pointer transition-all ${
                    selectedClusters.includes(cluster.id) 
                      ? 'bg-green-600/20 border-green-500' 
                      : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                  } ${cluster.status === 'offline' ? 'opacity-50' : ''}`}
                  onClick={() => cluster.status === 'online' && handleClusterToggle(cluster.id)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={selectedClusters.includes(cluster.id)}
                        disabled={cluster.status === 'offline'}
                        className="border-slate-500"
                      />
                      <div>
                        <div className="font-medium text-slate-200">{cluster.name}</div>
                        <div className="text-sm text-slate-400">ID: {cluster.id}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getEnvironmentColor(cluster.environment)}>
                        {cluster.environment}
                      </Badge>
                      <Badge className={getClusterStatusColor(cluster.status)}>
                        {cluster.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            取消
          </Button>
          <Button
            onClick={handleDeploy}
            disabled={!environment || selectedClusters.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {deploymentType === 'immediate' ? '立即部署' : '設定排程'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeploymentDialog;
