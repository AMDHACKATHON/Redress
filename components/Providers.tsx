'use client';

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "react-hot-toast";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        forcedTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <ConfirmProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'hot-toast-custom',
            }}
          />
        </ConfirmProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
