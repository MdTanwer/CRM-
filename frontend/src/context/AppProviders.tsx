import React from "react";
import type { ReactNode } from "react";
import { ServiceProvider } from "./ServiceContext";
import { LeadProvider } from "./LeadContext";
import { EmployeeProvider } from "./EmployeeContext";

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ServiceProvider>
      <LeadProvider>
        <EmployeeProvider>{children}</EmployeeProvider>
      </LeadProvider>
    </ServiceProvider>
  );
};
