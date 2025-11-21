import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { setUser } from '@/store/slices/authSlice';
import { RootState } from '@/store/store';
import { logActivity } from '@/utils/activityLogger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ButtonLoader } from '@/components/loaders/ButtonLoader';
import { Building2, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import usersData from '@/mock/users.json';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mode } = useSelector((state: RootState) => state.theme);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = usersData.find(
      u => u.username === data.username && u.password === data.password
    );

    if (user && user.status === 'active') {
      const { password, ...userWithoutPassword } = user;
      dispatch(setUser(userWithoutPassword as any));
      logActivity('login', { ip: '192.168.1.1', device: 'Desktop' });
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } else {
      toast.error('Invalid credentials or inactive account');
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold">CRM System</CardTitle>
              <CardDescription className="text-base">
                Sign in to manage your contacts
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    className="pl-9"
                    {...register('username')}
                  />
                </div>
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-9"
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <ButtonLoader size={16} />
                    <span className="ml-2">Signing in...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-2 rounded-lg bg-muted/50 p-4">
              <p className="text-xs font-semibold text-muted-foreground">Demo Credentials:</p>
              <div className="space-y-1 text-xs">
                <p><strong>Admin:</strong> admin / Admin@123</p>
                <p><strong>HR:</strong> hr_manager / Hr@123</p>
                <p><strong>User:</strong> user1 / User@123</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Secure role-based authentication system
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
