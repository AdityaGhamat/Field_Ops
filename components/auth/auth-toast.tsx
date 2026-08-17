"use client";

import { toast, Toaster } from "react-hot-toast";

const tokens = {
  success: "#2E7D32",
  successContainer: "#D7E8D8",
  onSuccessContainer: "#0B3D2E",
  error: "#B3261E",
  errorContainer: "#F9DEDC",
  onErrorContainer: "#410E0B",
  info: "#0B57D0",
  infoContainer: "#D3E3FD",
  onInfoContainer: "#041E49",
  surface: "#FDFCFF",
  surfaceContainerLow: "#F7F2FA",
  surfaceContainer: "#F3EDF7",
  onSurface: "#1D1B20",
  onSurfaceVariant: "#49454F",
  shadow: "0 1px 3px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.08)",
  radius: "12px",
};

export const AuthToaster = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      duration: 4000,
      style: {
        background: tokens.surfaceContainerLow,
        color: tokens.onSurface,
        boxShadow: tokens.shadow,
        borderRadius: tokens.radius,
        padding: "14px 16px",
        maxWidth: "400px",
        fontFamily: "Roboto, 'Helvetica Neue', Arial, sans-serif",
        fontSize: "14px",
        lineHeight: "20px",
        fontWeight: 500,
        transition: "all 0.2s ease-in-out",
      },
      success: {
        duration: 3000,
        iconTheme: {
          primary: tokens.success,
          secondary: "#FFFFFF",
        },
      },
      error: {
        duration: 5000,
        iconTheme: {
          primary: tokens.error,
          secondary: "#FFFFFF",
        },
      },
    }}
  />
);

// Auth-specific toast helpers with modern M3 tonal containers
export const showAuthSuccess = (message: string) =>
  toast.success(message, {
    style: {
      background: tokens.successContainer,
      color: tokens.onSuccessContainer,
      borderRadius: tokens.radius,
      padding: "14px 16px",
      maxWidth: "400px",
      fontFamily: "Roboto, 'Helvetica Neue', Arial, sans-serif",
      fontSize: "14px",
      lineHeight: "20px",
      fontWeight: 500,
    },
    iconTheme: {
      primary: tokens.success,
      secondary: "#FFFFFF",
    },
  });

export const showAuthError = (message: string) =>
  toast.error(message, {
    style: {
      background: tokens.errorContainer,
      color: tokens.onErrorContainer,
      borderRadius: tokens.radius,
      padding: "14px 16px",
      maxWidth: "400px",
      fontFamily: "Roboto, 'Helvetica Neue', Arial, sans-serif",
      fontSize: "14px",
      lineHeight: "20px",
      fontWeight: 500,
    },
    iconTheme: {
      primary: tokens.error,
      secondary: "#FFFFFF",
    },
  });

export const showAuthLoading = (message: string) =>
  toast.loading(message, {
    style: {
      background: tokens.infoContainer,
      color: tokens.onInfoContainer,
      borderRadius: tokens.radius,
      padding: "14px 16px",
      maxWidth: "400px",
      fontFamily: "Roboto, 'Helvetica Neue', Arial, sans-serif",
      fontSize: "14px",
      lineHeight: "20px",
      fontWeight: 500,
    },
    iconTheme: {
      primary: tokens.info,
      secondary: "#FFFFFF",
    },
  });

export const dismissAuthToast = (id: string) => toast.dismiss(id);
