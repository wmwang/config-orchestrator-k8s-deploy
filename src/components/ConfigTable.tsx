
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Rocket, Settings } from 'lucide-react';
import { ConfigItem } from '@/types/config';

interface ConfigTableProps {
  configs: ConfigItem[];
  onEdit: (config: ConfigItem) => void;
  onDelete: (id: string) => void;
  onDeploy: (config: ConfigItem) => void;
}

const ConfigTable: React.FC<ConfigTableProps> = ({ configs, onEdit, onDelete, onDeploy }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'deployed': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-100 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          配置項目管理
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-3 text-slate-300 font-medium">應用程式</th>
                <th className="text-left p-3 text-slate-300 font-medium">環境</th>
                <th className="text-left p-3 text-slate-300 font-medium">標籤</th>
                <th className="text-left p-3 text-slate-300 font-medium">選項</th>
                <th className="text-left p-3 text-slate-300 font-medium">鍵值</th>
                <th className="text-left p-3 text-slate-300 font-medium">狀態</th>
                <th className="text-left p-3 text-slate-300 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((config) => (
                <tr key={config.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="p-3 text-slate-200 font-medium">{config.application}</td>
                  <td className="p-3 text-slate-300">{config.profile}</td>
                  <td className="p-3 text-slate-300">{config.label}</td>
                  <td className="p-3 text-slate-300">{config.options}</td>
                  <td className="p-3 text-slate-300 font-mono text-sm">{config.key}</td>
                  <td className="p-3">
                    <Badge className={getStatusColor(config.status)}>
                      {config.status}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(config)}
                        className="h-8 w-8 p-0 hover:bg-blue-500/20 hover:text-blue-400"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeploy(config)}
                        className="h-8 w-8 p-0 hover:bg-green-500/20 hover:text-green-400"
                      >
                        <Rocket className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(config.id)}
                        className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfigTable;
