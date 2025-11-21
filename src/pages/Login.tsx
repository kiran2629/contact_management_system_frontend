import { useState } from "react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { setCredentials } from "@/store/slices/authSlice";
import { RootState } from "@/store/store";
import { logActivity } from "@/utils/activityLogger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonLoader } from "@/components/loaders/ButtonLoader";
import {
  Building2,
  Lock,
  User,
  Sparkles,
  Shield,
  Zap,
  Crown,
  Users,
  UserCircle,
  Star,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useLoginMutation } from "@/store/services/authApi";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mode } = useSelector((state: RootState) => state.theme);
  const [loginMutation, { isLoading }] = useLoginMutation();
  const [detectedRole, setDetectedRole] = useState<
    "Admin" | "HR" | "User" | null
  >(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const email = watch("email");

  // Detect role based on email
  React.useEffect(() => {
    if (email) {
      if (email.toLowerCase().includes("admin")) {
        setDetectedRole("Admin");
      } else if (email.toLowerCase().includes("hr")) {
        setDetectedRole("HR");
      } else if (email.toLowerCase().includes("user")) {
        setDetectedRole("User");
      } else {
        setDetectedRole(null);
      }
    } else {
      setDetectedRole(null);
    }
  }, [email]);

  // Helper function to decode JWT token
  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  };

  const onSubmit = async (data: LoginForm) => {
    try {
      // Call the real API
      const result = await loginMutation({
        email: data.email,
        password: data.password,
      }).unwrap();

      // Decode JWT token to extract user information
      const decodedToken = decodeJWT(result.accessToken);

      if (!decodedToken) {
        toast.error("Failed to decode authentication token");
        return;
      }

      // Map decoded token to expected format
      const userData = {
        id: decodedToken._id || decodedToken.id || "",
        username:
          decodedToken.userName ||
          decodedToken.username ||
          data.email.split("@")[0],
        role: decodedToken.role as "Admin" | "HR" | "User",
        allowed_categories: decodedToken.allowed_categories || [],
        name:
          decodedToken.userName ||
          decodedToken.name ||
          decodedToken.username ||
          data.email.split("@")[0],
        email: decodedToken.email || data.email,
        avatar: "",
      };

      // Store credentials
      dispatch(
        setCredentials({
          user: userData,
          token: result.accessToken,
        })
      );

      // Store refresh token in localStorage
      localStorage.setItem("crm_refresh_token", result.refreshToken);

      // Set refresh token as a cookie so backend can read it from req.cookies.refreshToken
      // The backend VerifyJwtToken middleware expects refreshToken in cookies
      // For cross-origin requests (different ports), we need to ensure the cookie is accessible
      // Note: Cookies set via document.cookie are subject to same-origin policy
      // The backend should also set cookies during login, which will be sent automatically with credentials: "include"
      const cookieOptions = [
        `refreshToken=${result.refreshToken}`,
        "path=/",
        "SameSite=Lax", // For localhost, Lax should work. For production, might need SameSite=None; Secure
        `max-age=${7 * 24 * 60 * 60}`, // 7 days
      ].join("; ");
      document.cookie = cookieOptions;

      logActivity("login", { ip: "192.168.1.1", device: "Desktop" });
      toast.success(`Welcome back, ${userData.name || userData.username}!`);

      // Navigate based on role
      switch (userData.role) {
        case "Admin":
          navigate("/dashboard");
          break;
        case "HR":
          navigate("/dashboard");
          break;
        case "User":
          navigate("/dashboard");
          break;
        default:
          navigate("/dashboard");
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.error ||
        error?.data?.message ||
        error?.message ||
        "Invalid credentials";
      toast.error(errorMessage);
    }
  };

  // Animated background particles
  const particles = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
  }));

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute -left-1/4 -top-1/4 h-[800px] w-[800px] rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -right-1/4 -bottom-1/4 h-[800px] w-[800px] rounded-full bg-gradient-to-r from-blue-500/30 to-cyan-500/30 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Floating Particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute h-1 w-1 rounded-full bg-white/20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Image/Animation Area */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 text-white"
        >
          <div className="max-w-md space-y-8">
            {/* Logo/Icon Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <motion.div
                className="relative flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-white/20 shadow-2xl"
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Building2 className="h-16 w-16 text-white" />
                <motion.div
                  className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-400/50 to-pink-400/50 blur-xl"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </motion.div>

            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4 text-center"
            >
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Contact Management
              </h1>
              <p className="text-xl text-purple-100">
                Streamline your business relationships
              </p>
            </motion.div>

            {/* Feature Icons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-3 gap-6 pt-8"
            >
              {[
                { icon: Shield, text: "Secure" },
                { icon: Zap, text: "Fast" },
                { icon: Sparkles, text: "Modern" },
              ].map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex flex-col items-center gap-2 rounded-xl bg-white/10 p-4 backdrop-blur-sm border border-white/20"
                >
                  <feature.icon className="h-8 w-8 text-purple-300" />
                  <span className="text-sm font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex w-full items-center justify-center p-4 lg:w-1/2"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
            className="w-full max-w-md"
          >
            <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-2xl dark:bg-slate-900/50">
              <CardContent className="p-8">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-8 text-center"
                >
                  <motion.div
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Building2 className="h-8 w-8 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white">
                    Welcome Back
                  </h2>
                  <p className="mt-2 text-purple-200">
                    Sign in to access your dashboard
                  </p>
                </motion.div>

                {/* Login Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Email Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="email" className="text-white">
                      Email
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-purple-300" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="border-white/20 bg-white/10 pl-10 text-white placeholder:text-purple-200 focus:border-purple-400 focus:ring-purple-400"
                        {...register("email")}
                      />
                      {/* Role Detection Indicator */}
                      {detectedRole && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute right-3 top-3"
                        >
                          {detectedRole === "Admin" && (
                            <motion.div
                              animate={{ rotate: [0, 360] }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            >
                              <Crown className="h-5 w-5 text-yellow-400" />
                            </motion.div>
                          )}
                          {detectedRole === "HR" && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <Users className="h-5 w-5 text-cyan-400" />
                            </motion.div>
                          )}
                          {detectedRole === "User" && (
                            <motion.div
                              animate={{ rotate: [0, 180, 360] }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            >
                              <UserCircle className="h-5 w-5 text-pink-400" />
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </div>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-red-400"
                      >
                        {errors.email.message}
                      </motion.p>
                    )}
                  </motion.div>

                  {/* Password Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="password" className="text-white">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-purple-300" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        className="border-white/20 bg-white/10 pl-10 text-white placeholder:text-purple-200 focus:border-purple-400 focus:ring-purple-400"
                        {...register("password")}
                      />
                    </div>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-red-400"
                      >
                        {errors.password.message}
                      </motion.p>
                    )}
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <ButtonLoader size={16} />
                          <span className="ml-2">Signing in...</span>
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </motion.div>
                </form>

                {/* Role Cards with Animations */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-6 space-y-3"
                >
                  <p className="text-xs font-semibold text-purple-200 text-center mb-4">
                    Select Your Role:
                  </p>

                  {/* Admin Role Card */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      await setValue("email", "test@example.com", {
                        shouldValidate: true,
                      });
                      await setValue("password", "password123", {
                        shouldValidate: true,
                      });
                      trigger();
                    }}
                    className="group relative cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-4 backdrop-blur-sm border border-blue-400/30 hover:border-blue-400/60 transition-all"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <div className="relative flex items-center gap-3">
                      <motion.div
                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg"
                        animate={{
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Crown className="h-6 w-6 text-white" />
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white">Admin</h3>
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          </motion.div>
                        </div>
                        <p className="text-xs text-blue-200">
                          test@example.com
                        </p>
                      </div>
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <CheckCircle2 className="h-5 w-5 text-blue-400" />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* HR Role Card */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      await setValue("email", "hr@example.com", {
                        shouldValidate: true,
                      });
                      await setValue("password", "password123", {
                        shouldValidate: true,
                      });
                      trigger();
                    }}
                    className="group relative cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-teal-600/20 to-cyan-600/20 p-4 backdrop-blur-sm border border-teal-400/30 hover:border-teal-400/60 transition-all"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-teal-600/10 to-cyan-600/10"
                      animate={{
                        x: ["100%", "-100%"],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <div className="relative flex items-center gap-3">
                      <motion.div
                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg"
                        animate={{
                          y: [0, -10, 0],
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Users className="h-6 w-6 text-white" />
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white">HR Manager</h3>
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <Sparkles className="h-4 w-4 text-cyan-300" />
                          </motion.div>
                        </div>
                        <p className="text-xs text-teal-200">hr@example.com</p>
                      </div>
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: 0.3,
                        }}
                      >
                        <CheckCircle2 className="h-5 w-5 text-teal-400" />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* User Role Card */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      await setValue("email", "user@example.com", {
                        shouldValidate: true,
                      });
                      await setValue("password", "password123", {
                        shouldValidate: true,
                      });
                      trigger();
                    }}
                    className="group relative cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-pink-600/20 to-rose-600/20 p-4 backdrop-blur-sm border border-pink-400/30 hover:border-pink-400/60 transition-all"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-pink-600/10 to-rose-600/10"
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <div className="relative flex items-center gap-3">
                      <motion.div
                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg"
                        animate={{
                          rotate: [0, -10, 10, 0],
                          scale: [1, 1.08, 1],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <UserCircle className="h-6 w-6 text-white" />
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white">User</h3>
                          <motion.div
                            animate={{ rotate: [0, 180, 360] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <Zap className="h-4 w-4 text-yellow-300" />
                          </motion.div>
                        </div>
                        <p className="text-xs text-pink-200">
                          user@example.com
                        </p>
                      </div>
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: 0.6,
                        }}
                      >
                        <CheckCircle2 className="h-5 w-5 text-pink-400" />
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>

            {/* Footer Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-4 text-center text-sm text-purple-200"
            >
              Secure role-based authentication system
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
