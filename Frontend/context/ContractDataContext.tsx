"use client";

import React, { createContext, useContext, useState } from "react";

export type Campaign = {
  id: number;
  title: string;
  description: string;
  category: string;
  creator: string;
  goal: number; // in ether (float)
  pledged: number; // in ether (float)
  startAt: number; // unix seconds
  endAt: number; // unix seconds
  claimed: boolean;
};

type ContractContextValue = {
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
};

const ContractDataContext = createContext<ContractContextValue | null>(null);

export const ContractDataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  return (
    <ContractDataContext.Provider value={{ campaigns, setCampaigns }}>
      {children}
    </ContractDataContext.Provider>
  );
};

export const useContractData = () => {
  const ctx = useContext(ContractDataContext);
  if (!ctx)
    throw new Error("useContractData must be used within ContractDataProvider");
  return ctx;
};

export default ContractDataProvider;
