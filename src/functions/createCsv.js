import Papa from 'papaparse';

export default function createCsv(data, filename = 'data.csv', includeHeader = true) {
    const config = {
        header: includeHeader
    };
    const csv = Papa.unparse(data, config);

    // Create a Blob from the CSV string
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    // Create a hidden anchor element
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    // Append, trigger the download, and remove the anchor element
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};