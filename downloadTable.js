function addCSVButton(tableId, name) {
    // Get the table element
    var table = document.getElementById(tableId);

    // Create the button
    var button = document.createElement("button");
    button.innerHTML = `Download ${name} table as CSV`;

    // Add a click event handler to the button
    button.addEventListener("click", function () {
        // Create a CSV string from the table data
        var csvString = tableToCSV(table);

        // Download the CSV file
        downloadCSV(csvString);
    });

    // Add the button to the page just above the table element
    table.parentNode.insertBefore(button, table);
}

function tableToCSV(table) {
    // Get the rows of the table
    var rows = table.rows;

    // Initialize the CSV string
    var csvString = "";

    // Loop through the rows
    for (var i = 0; i < rows.length; i++) {
        // Get the cells in the current row
        var cells = rows[i].cells;

        // Loop through the cells
        for (var j = 0; j < cells.length; j++) {
            // Add the cell value to the CSV string, with quotes around it to escape any commas
            csvString += '"' + cells[j].innerHTML + '"';

            // Add a comma after each cell, except for the last one
            if (j < cells.length - 1) {
                csvString += ",";
            }
        }

        // Add a new line after each row, except for the last one
        if (i < rows.length - 1) {
            csvString += "\n";
        }
    }

    return csvString;
}

function downloadCSV(csvString) {
    // Create a hidden anchor element
    var link = document.createElement("a");
    link.style.display = "none";

    // Set the href and download attributes of the anchor element
    link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csvString);
    link.download = "table.csv";

    // Add the anchor element to the page and click it
    document.body.appendChild(link);
    link.click();

    // Remove the anchor element
    document.body.removeChild(link);
}
