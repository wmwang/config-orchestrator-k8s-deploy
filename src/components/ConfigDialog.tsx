
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
    status: 'draft' as 'deployed' | 'draft' | 'schedule'
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
        status: 'draft'
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {config ? '編輯配置' : '新增配置'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="application">應用程式</Label>
              <Input
                id="application"
                value={formData.application}
                onChange={(e) => handleInputChange('application', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile">環境</Label>
              <Input
                id="profile"
                value={formData.profile}
                onChange={(e) => handleInputChange('profile', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="label">標籤</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => handleInputChange('label', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="options">選項</Label>
              <Input
                id="options"
                value={formData.options}
                onChange={(e) => handleInputChange('options', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="key">鍵值</Label>
            <Input
              id="key"
              value={formData.key}
              onChange={(e) => handleInputChange('key', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="config">配置內容</Label>
            <Textarea
              id="config"
              value={formData.config}
              onChange={(e) => handleInputChange('config', e.target.value)}
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>狀態</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="schedule">排程</SelectItem>
                <SelectItem value="deployed">已部署</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
