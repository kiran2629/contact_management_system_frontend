import { ReactNode, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { ModernLayout } from "./ModernLayout";
import { SidebarLayout } from "./SidebarLayout";
import { MinimalLayout } from "./MinimalLayout";
import { BottomBarLayout } from "./BottomBarLayout";
import { CommandBarLayout } from "./CommandBarLayout";
import { useGetSignedUserQuery } from "@/store/services/authApi";
import { setCredentials } from "@/store/slices/authSlice";

interface LayoutRouterProps {
  children: ReactNode;
}

export const LayoutRouter = ({ children }: LayoutRouterProps) => {
  const dispatch = useDispatch();
  const { currentLayout } = useSelector((state: RootState) => state.layout);
  const { user, token, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  // Call getSignedUser API on every page load to ensure permissions are up-to-date
  const { data: signedUserData } = useGetSignedUserQuery(undefined, {
    skip: !isAuthenticated || !token,
    // Refetch on every mount to ensure fresh permissions on every page
    refetchOnMountOrArgChange: true,
  });

  // Update user with permissions when fetched
  useEffect(() => {
    if (signedUserData && user && token && signedUserData.permissions) {
      // The transformResponse already extracts user from { success: true, user: {...} }
      // So signedUserData is the user object with permissions directly on it
      const permissions = signedUserData.permissions;

      // Only update if permissions are different from current permissions
      // Compare permissions to avoid unnecessary updates and infinite loops
      const currentPermissionsStr = JSON.stringify(user.permissions || {});
      const newPermissionsStr = JSON.stringify(permissions);

      if (currentPermissionsStr !== newPermissionsStr) {
        const updatedUser = {
          ...user,
          permissions,
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

  switch (currentLayout) {
    case "sidebar":
      return <SidebarLayout>{children}</SidebarLayout>;
    case "minimal":
      return <MinimalLayout>{children}</MinimalLayout>;
    case "bottom":
      return <BottomBarLayout>{children}</BottomBarLayout>;
    case "command":
      return <CommandBarLayout>{children}</CommandBarLayout>;
    case "floating":
    default:
      return <ModernLayout>{children}</ModernLayout>;
  }
};
