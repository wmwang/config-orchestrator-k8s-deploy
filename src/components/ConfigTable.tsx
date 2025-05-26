
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Trash2, Rocket, Settings, ListFilter } from 'lucide-react';
import { ConfigItem } from '@/types/config';
import ThemeToggle from './ThemeToggle';

interface ConfigTableProps {
  configs: ConfigItem[];
  onEdit: (config: ConfigItem) => void;
  onDelete: (id: string) => void;
  onDeploy: (config: ConfigItem) => void;
}

const ConfigTable: React.FC<ConfigTableProps> = ({ configs, onEdit, onDelete, onDeploy }) => {
  const [selectedLabel, setSelectedLabel] = useState<string>('all');

  // 取得所有唯一的標籤
  const uniqueLabels = useMemo(() => {
    const labels = Array.from(new Set(configs.map(config => config.label)));
    return labels.sort();
  }, [configs]);

  // 根據選擇的標籤篩選配置
  const filteredConfigs = useMemo(() => {
    if (selectedLabel === 'all') {
      return configs;
    }
    return configs.filter(config => config.label === selectedLabel);
  }, [configs, selectedLabel]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'deployed': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 dark:bg-slate-800/50 dark:border-slate-700 bg-white border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-100 dark:text-slate-100 text-slate-900 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            配置項目管理
          </CardTitle>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <ListFilter className="h-4 w-4 text-slate-400 dark:text-slate-400 text-slate-600" />
            <Select value={selectedLabel} onValueChange={setSelectedLabel}>
              <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600 text-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 bg-white border-gray-300 text-gray-900">
                <SelectValue placeholder="篩選標籤" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600 dark:bg-slate-700 dark:border-slate-600 bg-white border-gray-300">
                <SelectItem value="all" className="text-slate-200 focus:bg-slate-600 dark:text-slate-200 dark:focus:bg-slate-600 text-gray-900 focus:bg-gray-100">
                  全部標籤
                </SelectItem>
                {uniqueLabels.map((label) => (
                  <SelectItem 
                    key={label} 
                    value={label}
                    className="text-slate-200 focus:bg-slate-600 dark:text-slate-200 dark:focus:bg-slate-600 text-gray-900 focus:bg-gray-100"
                  >
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {selectedLabel !== 'all' && (
          <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-400 text-slate-600">
            <span>篩選結果:</span>
            <Badge variant="outline" className="text-slate-300 border-slate-600 dark:text-slate-300 dark:border-slate-600 text-slate-700 border-slate-300">
              {selectedLabel}
            </Badge>
            <span>({filteredConfigs.length} 項配置)</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 dark:border-slate-700 border-gray-200">
                <th className="text-left p-3 text-slate-300 dark:text-slate-300 text-slate-700 font-medium">應用程式</th>
                <th className="text-left p-3 text-slate-300 dark:text-slate-300 text-slate-700 font-medium">環境</th>
                <th className="text-left p-3 text-slate-300 dark:text-slate-300 text-slate-700 font-medium">標籤</th>
                <th className="text-left p-3 text-slate-300 dark:text-slate-300 text-slate-700 font-medium">選項</th>
                <th className="text-left p-3 text-slate-300 dark:text-slate-300 text-slate-700 font-medium">鍵值</th>
                <th className="text-left p-3 text-slate-300 dark:text-slate-300 text-slate-700 font-medium">狀態</th>
                <th className="text-left p-3 text-slate-300 dark:text-slate-300 text-slate-700 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredConfigs.map((config) => (
                <tr key={config.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 dark:border-slate-700/50 dark:hover:bg-slate-700/30 border-gray-200/50 hover:bg-gray-50/30 transition-colors">
                  <td className="p-3 text-slate-200 dark:text-slate-200 text-slate-800 font-medium">{config.application}</td>
                  <td className="p-3 text-slate-300 dark:text-slate-300 text-slate-600">{config.profile}</td>
                  <td className="p-3 text-slate-300 dark:text-slate-300 text-slate-600">{config.label}</td>
                  <td className="p-3 text-slate-300 dark:text-slate-300 text-slate-600">{config.options}</td>
                  <td className="p-3 text-slate-300 dark:text-slate-300 text-slate-600 font-mono text-sm">{config.key}</td>
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
          {filteredConfigs.length === 0 && (
            <div className="text-center py-8 text-slate-400 dark:text-slate-400 text-slate-600">
              沒有找到符合篩選條件的配置項目
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfigTable;
