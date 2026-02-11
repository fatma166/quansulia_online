import { ReactNode } from 'react';
import ChatBot from './ChatBot';

interface ServicePageWithChatProps {
  children: ReactNode;
  serviceCategory?: string;
  serviceType?: string;
}

export default function ServicePageWithChat({
  children,
  serviceCategory,
  serviceType
}: ServicePageWithChatProps) {
  return (
    <>
      {children}
      <ChatBot serviceCategory={serviceCategory} serviceType={serviceType} />
    </>
  );
}
