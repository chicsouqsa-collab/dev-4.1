
import React from 'react';

interface AutocompleteInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fieldName: string;
    options: string[];
    className?: string;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ value, onChange, fieldName, options, className }) => {
    const dataListId = `options-for-${fieldName.replace(/\s+/g, '-')}`;
    return (
        <>
            <input
                type="text"
                value={value || ''}
                onChange={onChange}
                list={dataListId}
                className={className || "w-48 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md p-1 focus:ring-indigo-500 focus:border-indigo-500"}
            />
            <datalist id={dataListId}>
                {options.map(option => (
                    <option key={option} value={option} />
                ))}
            </datalist>
        </>
    );
};

export default AutocompleteInput;