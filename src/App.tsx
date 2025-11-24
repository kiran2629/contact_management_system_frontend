import { useEffect, Suspense, lazy } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { store, RootState } from "@/store/store";
import { initializeAuth, setCredentials } from "@/store/slices/authSlice";
import { setTheme } from "@/store/slices/themeSlice";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PremiumLoader } from "@/components/loaders/PremiumLoader";
import { useGetSignedUserQuery } from "@/store/services/authApi";

// AI Features
import { I18nProvider } from "@/ai-features/localization/i18nProvider";
import { AssistantButton } from "@/ai-features/ai-assistant/AssistantButton";
import { VoiceButton } from "@/ai-features/voice/VoiceButton";

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
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Component to fetch and update permissions on every page load for all roles
const PermissionLoader = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  // Always fetch permissions when authenticated (for all roles: Admin, HR, User)
  // This ensures permissions are always up-to-date on every page
  const { data: signedUserData } = useGetSignedUserQuery(undefined, {
    skip: !isAuthenticated || !token,
    // Refetch on every mount to ensure fresh permissions
    refetchOnMountOrArgChange: true,
  });

  // Update user with permissions and profile_photo when fetched
  useEffect(() => {
    if (signedUserData && user && token) {
      // The transformResponse already extracts user from { success: true, user: {...} }
      // So signedUserData is the user object with permissions and profile_photo directly on it
      const permissions = signedUserData.permissions;
      const profile_photo = signedUserData.profile_photo;

      // Check if permissions or profile_photo changed
      const currentPermissionsStr = JSON.stringify(user.permissions || {});
      const newPermissionsStr = JSON.stringify(permissions || {});
      const profilePhotoChanged = user.profile_photo !== profile_photo;

      if (currentPermissionsStr !== newPermissionsStr || profilePhotoChanged) {
        const updatedUser = {
          ...user,
          ...(permissions && { permissions }),
          ...(profile_photo !== undefined && { profile_photo }),
        };
        dispatch(
          setCredentials({
            user: updatedUser,
            token: token,
          })
        );
      }
    }
    // Only depend on signedUserData and token, not user to avoid infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedUserData, token, dispatch]);

  return null;
};

const AppContent = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, user, token } = useSelector(
    (state: RootState) => state.auth
  );
  const { mode } = useSelector((state: RootState) => state.theme);

  // Always fetch permissions when authenticated (for all roles: Admin, HR, User)
  // This ensures permissions are always up-to-date on every page
  const { isLoading: isLoadingPermissions } = useGetSignedUserQuery(undefined, {
    skip: !isAuthenticated || !token,
    // Refetch on every mount to ensure fresh permissions
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    dispatch(initializeAuth());
    dispatch(setTheme(mode));
    // Set document title
    document.title = "CRM";
  }, [dispatch]);

  // Show loading if initializing or if permissions are being loaded on first load
  if (
    loading ||
    (isAuthenticated && isLoadingPermissions && !user?.permissions)
  ) {
    return <PremiumLoader />;
  }

  return (
    <Suspense fallback={<PremiumLoader />}>
      {isAuthenticated && <PermissionLoader />}
      
      {/* AI Features - Only show when logged in */}
      {isAuthenticated && (
        <>
          <AssistantButton />
          <VoiceButton />
        </>
      )}
      
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

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <Provider store={store}>
    <I18nProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </I18nProvider>
  </Provider>
);

export default App;
