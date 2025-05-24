
export interface ConfigItem {
  id: string;
  application: string;
  profile: string;
  label: string;
  options: string;
  key: string;
  config: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'pending' | 'deployed';
}

export interface DeploymentOption {
  type: 'immediate' | 'scheduled';
  scheduledTime?: string;
  targetClusters: string[];
  environment: string;
}

export interface K8sCluster {
  id: string;
  name: string;
  environment: 'dev' | 'staging' | 'production';
  status: 'online' | 'offline';
}
