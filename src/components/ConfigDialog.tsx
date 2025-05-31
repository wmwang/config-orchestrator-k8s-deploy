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
  // 1. 修改初始狀態，將 profile 預設為 'dev'
  const [formData, setFormData] = useState({
    application: '',
    profile: 'prod',
    label: ' latest',
    key: '',
    value: '',
    status: 'disable'
  });

  useEffect(() => {
    if (config) {
      setFormData({
        application: config.application,
        profile: config.profile,
        label: config.label,
        key: config.key,
        value: config.value,
        status: config.status
      });
    } else {
      // 2. 當新增時，將 profile 重置為預設值 'dev'
      setFormData({
        application: '',
        profile: 'prod', 
        label: ' latest',
        key: '',
        value: '',
        status: 'disable'
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
            {/* --- START: 關鍵修改處 --- */}
            <div className="space-y-2">
              <Label htmlFor="profile">環境</Label>
              
                <Select
                  value={formData.profile}
                  onValueChange={(value) => handleInputChange('profile', value)}
                  required
                >
                  <SelectTrigger id="profile">
                    <SelectValue placeholder="請選擇環境" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dev">dev</SelectItem>
                    <SelectItem value="prod">prod</SelectItem>
                    <SelectItem value="staging">staging</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            {/* --- END: 關鍵修改處 --- */}
          </div>

          <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
              <Label htmlFor="label">標籤</Label>
              {/* 3. 移除條件渲染，統一使用 Select 元件 */}
              <Select
                // 3a. 將 value 綁定到 formData.label
                value={formData.label}
                // 3b. onValueChange 時更新 'label' 欄位
                onValueChange={(value) => handleInputChange('label', value)}
                required
              >
                <SelectTrigger id="label">
                  <SelectValue placeholder="請選擇標籤" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">latest</SelectItem>
                  <SelectItem value="candidate">candidate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="key">鍵</Label>
            <Input
              id="key"
              value={formData.key}
              onChange={(e) => handleInputChange('key', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="config">值</Label>
            <Textarea
              id="config"
              value={formData.value}
              onChange={(e) => handleInputChange('value', e.target.value)}
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">狀態</Label>
            <Input
              id="status"
              value={formData.status} // <--- 修改：綁定到 state 中的 formData.status
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
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