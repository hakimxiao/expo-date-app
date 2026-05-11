import React from "react";
import { ClerkProvider } from "./ClerkProvider";

const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return <ClerkProvider>{children}</ClerkProvider>;
};

export default AppProviders;
