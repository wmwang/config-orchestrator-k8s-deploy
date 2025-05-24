
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfigItem } from '@/types/config';

interface ConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ConfigItem | null;
  onSave: (configData: Omit<ConfigItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const ConfigDialog: React.FC<ConfigDialogProps> = ({ open, onOpenChange, config, onSave }) => {
  const [formData, setFormData] = useState({
    application: '',
    profile: '',
    label: '',
    options: '',
    key: '',
    config: '',
    status: 'active' as 'active' | 'pending' | 'deployed'
  });

  useEffect(() => {
    if (config) {
      setFormData({
        application: config.application,
        profile: config.profile,
        label: config.label,
        options: config.options,
        key: config.key,
        config: config.config,
        status: config.status
      });
    } else {
      setFormData({
        application: '',
        profile: '',
        label: '',
        options: '',
        key: '',
        config: '',
        status: 'active'
      });
    }
  }, [config, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-slate-100 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {config ? '編輯配置' : '新增配置'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="application" className="text-slate-300">應用程式</Label>
              <Input
                id="application"
                value={formData.application}
                onChange={(e) => handleInputChange('application', e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile" className="text-slate-300">環境</Label>
              <Input
                id="profile"
                value={formData.profile}
                onChange={(e) => handleInputChange('profile', e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-100"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="label" className="text-slate-300">標籤</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => handleInputChange('label', e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="options" className="text-slate-300">選項</Label>
              <Input
                id="options"
                value={formData.options}
                onChange={(e) => handleInputChange('options', e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="key" className="text-slate-300">鍵值</Label>
            <Input
              id="key"
              value={formData.key}
              onChange={(e) => handleInputChange('key', e.target.value)}
              className="bg-slate-700 border-slate-600 text-slate-100"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="config" className="text-slate-300">配置內容</Label>
            <Textarea
              id="config"
              value={formData.config}
              onChange={(e) => handleInputChange('config', e.target.value)}
              className="bg-slate-700 border-slate-600 text-slate-100 min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">狀態</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="active">啟用中</SelectItem>
                <SelectItem value="pending">待處理</SelectItem>
                <SelectItem value="deployed">已部署</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              取消
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {config ? '更新' : '新增'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConfigDialog;
