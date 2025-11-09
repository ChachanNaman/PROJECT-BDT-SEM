import React, { useState } from 'react';

const Visualizations = () => {
  const [powerBiUrl, setPowerBiUrl] = useState('');
  const [visualizations, setVisualizations] = useState([]);

  // Instructions for embedding Power BI
  const instructions = `To embed Power BI visualizations:
1. Export your data from MongoDB (use export-for-powerbi.js script)
2. Import CSV into Power BI Desktop or Power BI Service
3. Create visualizations (Content Distribution, Ratings by Genre, etc.)
4. Publish to Power BI Service
5. Go to File > Embed report > Website or portal
6. Copy the embed iframe code or URL
7. Paste it below and click "Add Visualization"`;

  const handleAddVisualization = () => {
    if (!powerBiUrl.trim()) {
      alert('Please enter a Power BI embed URL or iframe code');
      return;
    }

    const newViz = {
      id: Date.now(),
      embedCode: powerBiUrl,
      title: `Visualization ${visualizations.length + 1}`
    };

    setVisualizations([...visualizations, newViz]);
    setPowerBiUrl('');
  };

  const handleRemoveVisualization = (id) => {
    setVisualizations(visualizations.filter(viz => viz.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Data Visualizations</h1>

      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Power BI Integration</h2>
        
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-semibold text-blue-900 mb-2">Quick Setup:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside whitespace-pre-line">
            <li>Run: <code className="bg-blue-100 px-1 rounded">node export-for-powerbi.js</code> in MultiRec folder</li>
            <li>Import CSV files into Power BI Desktop or Power BI Service</li>
            <li>Create visualizations (Content Distribution, Ratings by Genre, etc.)</li>
            <li>Publish to Power BI Service</li>
            <li>Get embed code: File → Embed report → Website or portal</li>
            <li>Paste embed code or URL below and click "Add Visualization"</li>
          </ol>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="powerBiUrl">
            Power BI Embed URL or iframe code
          </label>
          <textarea
            id="powerBiUrl"
            value={powerBiUrl}
            onChange={(e) => setPowerBiUrl(e.target.value)}
            placeholder='Paste Power BI embed URL or iframe code here...
Example: <iframe width="1140" height="541.25" src="https://app.powerbi.com/reportEmbed?reportId=..." frameborder="0" allowFullScreen="true"></iframe>'
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 font-mono text-xs"
          />
        </div>

        <button
          onClick={handleAddVisualization}
          disabled={!powerBiUrl.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Visualization
        </button>
      </div>

      {visualizations.length > 0 && (
        <div className="space-y-6">
          {visualizations.map((viz) => (
            <div key={viz.id} className="bg-white shadow-lg rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{viz.title}</h2>
                <button
                  onClick={() => handleRemoveVisualization(viz.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
              <div className="relative w-full" style={{ paddingBottom: '56.25%', height: 0, minHeight: '400px' }}>
                {viz.embedCode.includes('<iframe') ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: viz.embedCode }}
                    className="absolute top-0 left-0 w-full h-full"
                    style={{ minHeight: '400px' }}
                  />
                ) : viz.embedCode.includes('http') ? (
                  <iframe
                    src={viz.embedCode}
                    title="Power BI Visualization"
                    className="absolute top-0 left-0 w-full h-full border-0"
                    allowFullScreen
                    style={{ minHeight: '400px' }}
                  />
                ) : (
                  <div className="absolute top-0 left-0 w-full h-full bg-gray-100 rounded flex items-center justify-center">
                    <p className="text-gray-500">Invalid embed code format</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions when no visualizations */}
      {visualizations.length === 0 && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">How to Add Visualizations</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Step 1: Export Data</h3>
              <p className="text-sm text-gray-700 mb-2">Run the export script to create CSV files:</p>
              <code className="block bg-gray-800 text-green-400 p-2 rounded text-sm mb-2">
                cd ~/Desktop/MultiRec<br/>
                node export-for-powerbi.js
              </code>
              <p className="text-xs text-gray-600">This creates: movies_export.csv, songs_export.csv, books_export.csv</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Step 2: Create Power BI Report</h3>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>Import CSV into Power BI Desktop or Power BI Service</li>
                <li>Create visualizations (Pie charts, Bar charts, etc.)</li>
                <li>Recommended: Content Distribution, Ratings by Genre, Top Rated Content</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Step 3: Get Embed Code</h3>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>Publish report to Power BI Service</li>
                <li>File → Embed report → Website or portal</li>
                <li>Copy the iframe code or URL</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Step 4: Add to Website</h3>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>Paste embed code or URL in the field above</li>
                <li>Click "Add Visualization"</li>
                <li>Visualization will appear below</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-yellow-900">💡 Alternative: Use Google Data Studio (Mac Compatible)</h3>
              <p className="text-sm text-yellow-800">
                Since Power BI Desktop is Windows-only, you can use Google Data Studio which works on Mac:
              </p>
              <ol className="text-xs text-yellow-800 mt-2 space-y-1 list-decimal list-inside">
                <li>Export data to CSV (use the script above)</li>
                <li>Upload CSV to Google Sheets</li>
                <li>Create Google Data Studio report</li>
                <li>Get embed URL and paste above</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Visualizations;

