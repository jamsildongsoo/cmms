import React from 'react';

interface PlaceholderPageProps {
    title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{title}</h1>
            <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
                This page is under construction.
            </div>
        </div>
    );
};

export default PlaceholderPage;
