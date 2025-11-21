import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { RootState } from '@/store/store';
import { updatePermission, resetPermissions } from '@/store/slices/permissionsSlice';
import { LayoutRouter } from '@/components/layout/LayoutRouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, Lock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const AdminPermissions = () => {
  const dispatch = useDispatch();
  const { permissions } = useSelector((state: RootState) => state.permissions);
  const [selectedRole, setSelectedRole] = useState<'Admin' | 'HR' | 'User'>('Admin');

  const handlePermissionChange = (type: 'actions' | 'fields', key: string, value: boolean) => {
    dispatch(updatePermission({ role: selectedRole, type, key, value }));
    toast.success('Permission updated');
  };

  const handleReset = () => {
    dispatch(resetPermissions());
    toast.success('Permissions reset to default');
  };

  const rolePermissions = permissions[selectedRole];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Permission Management</h1>
            <p className="text-muted-foreground">
              Configure role-based access controls
            </p>
          </div>
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset to Default
          </Button>
        </div>

        <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="Admin">
              <Shield className="mr-2 h-4 w-4" />
              Admin
            </TabsTrigger>
            <TabsTrigger value="HR">
              <Eye className="mr-2 h-4 w-4" />
              HR
            </TabsTrigger>
            <TabsTrigger value="User">
              <Lock className="mr-2 h-4 w-4" />
              User
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedRole} className="space-y-6">
            {/* Action Permissions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Action Permissions</CardTitle>
                  <CardDescription>
                    Control what actions {selectedRole} users can perform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(rolePermissions.actions).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <Label htmlFor={`action-${key}`} className="cursor-pointer font-medium">
                            {key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {getActionDescription(key)}
                          </p>
                        </div>
                        <Switch
                          id={`action-${key}`}
                          checked={value}
                          onCheckedChange={(checked) => handlePermissionChange('actions', key, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Field Permissions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Field Permissions</CardTitle>
                  <CardDescription>
                    Control what contact fields {selectedRole} users can access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(rolePermissions.fields).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <Label htmlFor={`field-${key}`} className="cursor-pointer font-medium">
                            {key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {getFieldDescription(key)}
                          </p>
                        </div>
                        <Switch
                          id={`field-${key}`}
                          checked={value}
                          onCheckedChange={(checked) => handlePermissionChange('fields', key, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Category Access */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Category Access</CardTitle>
                  <CardDescription>
                    Default categories accessible by {selectedRole} users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {rolePermissions.categories.map(category => (
                      <Badge key={category} className="text-sm">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </LayoutRouter>
  );
};

const getActionDescription = (action: string): string => {
  const descriptions: Record<string, string> = {
    view_contacts: 'View contact information',
    create_contact: 'Create new contacts',
    edit_contact: 'Edit existing contacts',
    delete_contact: 'Delete contacts',
    import_contacts: 'Import contacts from files',
    export_contacts: 'Export contacts to files',
    manage_users: 'Manage system users',
    manage_permissions: 'Manage role permissions',
    view_all_logs: 'View all activity logs',
    impersonate_user: 'Impersonate other users',
  };
  return descriptions[action] || '';
};

const getFieldDescription = (field: string): string => {
  const descriptions: Record<string, string> = {
    view_email: 'View email addresses',
    view_phone: 'View phone numbers',
    view_birthday: 'View birthday information',
    view_address: 'View physical addresses',
    view_notes: 'View contact notes',
    view_linkedin: 'View LinkedIn profiles',
    edit_email: 'Edit email addresses',
    edit_phone: 'Edit phone numbers',
    edit_birthday: 'Edit birthday information',
    edit_address: 'Edit physical addresses',
    edit_notes: 'Edit contact notes',
  };
  return descriptions[field] || '';
};

export default AdminPermissions;
