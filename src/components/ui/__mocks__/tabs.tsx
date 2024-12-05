import React from 'react';

export const Tabs = ({ children, defaultValue }: { children: React.ReactNode; defaultValue?: string }) => {
  return <div data-testid="tabs" data-default-value={defaultValue}>{children}</div>;
};

export const TabsList = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="tabs-list">{children}</div>;
};

export const TabsTrigger = ({ children, value }: { children: React.ReactNode; value: string }) => {
  return <div data-testid="tabs-trigger" data-value={value}>{children}</div>;
};

export const TabsContent = ({ children, value }: { children: React.ReactNode; value: string }) => {
  return <div data-testid="tabs-content" data-value={value}>{children}</div>;
};

export default Tabs;
