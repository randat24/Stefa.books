import React from 'react';

export const metadata = {
  title: 'Maintenance | Stefa.Books',
  description: 'Site is currently under maintenance',
};

const MaintenancePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full text-center px-4">
        <div className="mx-auto mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        
        <h1 className="text-h1 text-neutral-900 mb-4">Site Under Maintenance</h1>
        <p className="text-neutral-600 mb-8">
          We&apos;re currently performing scheduled maintenance. We&apos;ll be back online shortly.
        </p>
        
        <div className="bg-neutral-100 rounded-lg p-6 mb-8">
          <h2 className="font-semibold text-neutral-900 mb-2">Estimated Time</h2>
          <p className="text-neutral-600">30 minutes</p>
        </div>
        
        <div className="text-body-sm text-neutral-500">
          <p>For urgent inquiries, contact support@stefabooks.com</p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;