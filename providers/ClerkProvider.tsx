import { ClerkLoaded, ClerkProvider as ClerkProviderBase } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
}

interface ClerkProviderProps {
  children: React.ReactNode;
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  return (
    <ClerkProviderBase
      publishableKey={clerkPublishableKey}
      tokenCache={tokenCache}
    >
      <ClerkLoaded>{children}</ClerkLoaded>
    </ClerkProviderBase>
  );
}
