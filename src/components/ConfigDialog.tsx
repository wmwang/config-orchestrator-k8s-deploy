
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfigItem } from '@/types/config';

interface ConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config?: ConfigItem | null;
  onSave: (config: Omit<ConfigItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const ConfigDialog: React.FC<ConfigDialogProps> = ({ open, onOpenChange, config, onSave }) => {
  const [formData, setFormData] = useState({
    application: '',
    profile: '',
    label: '',
    options: '',
    key: '',
    config: '',
    status: 'active' as const
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
  }, [config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-slate-100 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {config ? '編輯配置項目' : '新增配置項目'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="application" className="text-slate-300">應用程式名稱</Label>
              <Input
                id="application"
                value={formData.application}
                onChange={(e) => setFormData({ ...formData, application: e.target.value })}
                className="bg-slate-700 border-slate-600 text-slate-100"
                placeholder="例如: user-service"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile" className="text-slate-300">環境配置</Label>
              <Select value={formData.profile} onValueChange={(value) => setFormData({ ...formData, profile: value })}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                  <SelectValue placeholder="選擇環境" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="development">開發環境</SelectItem>
                  <SelectItem value="staging">測試環境</SelectItem>
                  <SelectItem value="production">生產環境</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="label" className="text-slate-300">標籤</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="bg-slate-700 border-slate-600 text-slate-100"
                placeholder="例如: v1.0.0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="options" className="text-slate-300">選項</Label>
              <Input
                id="options"
                value={formData.options}
                onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                className="bg-slate-700 border-slate-600 text-slate-100"
                placeholder="例如: --reload"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="key" className="text-slate-300">配置鍵值</Label>
            <Input
              id="key"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              className="bg-slate-700 border-slate-600 text-slate-100 font-mono"
              placeholder="例如: database.host"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="config" className="text-slate-300">配置內容</Label>
            <Textarea
              id="config"
              value={formData.config}
              onChange={(e) => setFormData({ ...formData, config: e.target.value })}
              className="bg-slate-700 border-slate-600 text-slate-100 font-mono"
              placeholder="輸入配置內容，支援 JSON、YAML 等格式"
              rows={6}
              required
            />
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
