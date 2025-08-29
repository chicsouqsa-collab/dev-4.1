
import React from 'react';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Welcome to Chic Souq Product Enricher</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Streamline your product management workflow. Upload your basic product lists, and let our AI-powered tool enrich them with comprehensive data, ready for your e-commerce platform.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Upload New Products"
            description="Start a new batch by uploading a CSV file with your products."
            linkTo="/upload"
            icon={UploadIcon}
          />
          <DashboardCard
            title="View Data Library"
            description="Browse, search, and manage all your previously enriched products."
            linkTo="/library"
            icon={LibraryIcon}
          />
           <DashboardCard
            title="Enrichment History"
            description="Review past uploads and their enrichment status."
            linkTo="/history"
            icon={HistoryIcon}
          />
          <DashboardCard
            title="Configure Settings"
            description="Manage your Gemini API key, normalization rules, and AI instructions."
            linkTo="/settings"
            icon={SettingsIcon}
          />
        </div>
      </div>
    </div>
  );
};

interface CardProps {
  title: string;
  description: string;
  linkTo: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const DashboardCard: React.FC<CardProps> = ({ title, description, linkTo, icon: Icon }) => (
  <Link to={linkTo} className="block p-6 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
    <div className="flex items-center mb-3">
      <Icon className="w-8 h-8 text-indigo-500 mr-4" />
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h2>
    </div>
    <p className="text-gray-500 dark:text-gray-400">{description}</p>
  </Link>
);

const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" /></svg>
);
const LibraryIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6-2.292m0 0v14.25" /></svg>
);
const HistoryIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
);


export default DashboardPage;