import { useEffect, Suspense, lazy } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { store, RootState } from "@/store/store";
import { initializeAuth } from "@/store/slices/authSlice";
import { setTheme } from "@/store/slices/themeSlice";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PremiumLoader } from "@/components/loaders/PremiumLoader";

// Lazy load pages
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Contacts = lazy(() => import("./pages/Contacts"));
const AddContact = lazy(() => import("./pages/AddContact"));
const EditContact = lazy(() => import("./pages/EditContact"));
const NewContact = lazy(() => import("./pages/NewContact"));
const ContactDetails = lazy(() => import("./pages/ContactDetails"));
const ActivityLogs = lazy(() => import("./pages/ActivityLogs"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminPermissions = lazy(() => import("./pages/admin/AdminPermissions"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AppContent = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth
  );
  const { mode } = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    dispatch(initializeAuth());
    dispatch(setTheme(mode));
    // Set document title
    document.title = "CRM";
  }, [dispatch]);

  if (loading) {
    return <PremiumLoader />;
  }

  return (
    <Suspense fallback={<PremiumLoader />}>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/contacts"
          element={
            <ProtectedRoute requiredPermission="view_contacts">
              <Contacts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/contacts/new"
          element={
            <ProtectedRoute requiredPermission="create_contact">
              <NewContact />
            </ProtectedRoute>
          }
        />

        <Route
          path="/contacts/:id/edit"
          element={
            <ProtectedRoute requiredPermission="edit_contact">
              <EditContact />
            </ProtectedRoute>
          }
        />

        <Route
          path="/contacts/:id"
          element={
            <ProtectedRoute requiredPermission="view_contacts">
              <ContactDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/activity-logs"
          element={
            <ProtectedRoute>
              <ActivityLogs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute
              requiredRole="Admin"
              requiredPermission="manage_users"
            >
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/permissions"
          element={
            <ProtectedRoute
              requiredRole="Admin"
              requiredPermission="manage_permissions"
            >
              <AdminPermissions />
            </ProtectedRoute>
          }
        />

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <Provider store={store}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </Provider>
);

export default App;
