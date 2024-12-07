import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const DatabaseViewer = () => {
    const [content, setContent] = useState({});
    const [selectedTable, setSelectedTable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const apiUrl = `${API_URL}/content`;
            console.log('Fetching content from:', apiUrl);
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(
                    errorData?.message || 
                    `Server responded with status: ${response.status}`
                );
            }

            const data = await response.json();
            console.log('Received data:', data);
            setContent(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching content:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return (
        <div className="p-4">
            <div className="text-red-500 font-bold">Error:</div>
            <div className="text-red-500">{error}</div>
            <button 
                onClick={fetchContent}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Retry
            </button>
        </div>
    );

    const tables = Object.keys(content);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Database Content</h1>
            
            <div className="mb-4">
                <select 
                    className="border p-2 rounded"
                    onChange={(e) => setSelectedTable(e.target.value)}
                    value={selectedTable || ''}
                >
                    <option value="">Select a table</option>
                    {tables.map(table => (
                        <option key={table} value={table}>{table}</option>
                    ))}
                </select>
            </div>

            {selectedTable && content[selectedTable] && (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                        <thead>
                            <tr>
                                {Object.keys(content[selectedTable][0] || {}).map(header => (
                                    <th key={header} className="border p-2 bg-gray-100">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {content[selectedTable].map((row, index) => (
                                <tr key={index}>
                                    {Object.values(row).map((value, i) => (
                                        <td key={i} className="border p-2">
                                            {value?.toString() || ''}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DatabaseViewer;
