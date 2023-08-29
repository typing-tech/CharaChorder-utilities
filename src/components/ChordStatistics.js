import React, { useState, useEffect } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Snackbar, Alert } from '@mui/material';

const ChordStatistics = ({ chordLibrary }) => {
    const [chordStats, setChordStats] = useState({});
    const [letterCounts, setLetterCounts] = useState([]);
    const [dupWords, setDupWords] = useState([]);
    const [uniqueChordOutputs, setUniqueChordOutputs] = useState(new Set());
    const canvasRef = React.useRef(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const handleOpenSnackbar = () => {
        setOpenSnackbar(true);
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    useEffect(() => {
        const calculateStatistics = () => {
            const lengthCounts = {};
            const chordMapCounts = {};
            const lettersCounts = {};
            const newDupWords = [];
            const uniqueChordOutputs = new Set();

            // Adapted to work with array of objects
            chordLibrary.forEach(({ chordInput, chordOutput }) => {
                let chordMap = chordInput.replace(/[\s+]+/g, ' ');
                const chordMapLength = chordMap.split(' ').length;

                lengthCounts[chordMapLength] = (lengthCounts[chordMapLength] || 0) + 1;
                uniqueChordOutputs.add(chordOutput);
                const chord = chordOutput;

                chordMapCounts[chord] = (chordMapCounts[chord] || 0) + 1;

                if (chordMapCounts[chord] > 1) newDupWords.push(chord);

                const letters = chordMap.split(' ');
                letters.forEach(letter => {
                    lettersCounts[letter] = (lettersCounts[letter] || 0) + 1;
                });
            });

            setUniqueChordOutputs(uniqueChordOutputs);
            setChordStats(lengthCounts);
            setLetterCounts(Object.entries(lettersCounts).sort((a, b) => b[1] - a[1]));
            setDupWords(newDupWords);
        };

        calculateStatistics();
    }, [chordLibrary]);

    useEffect(() => {
        const currentCanvasRef = canvasRef.current;
        if (!currentCanvasRef) return;

        const generateBannerContent = (numChords, numUniqueChords, lengthCounts) => {
            let xAxis = [];
            let counts = [];
            for (var length in lengthCounts) {
                xAxis.push(length);
                counts.push(lengthCounts[length]);
            }

            // Set the canvas size
            var canvas = document.createElement("canvas");
            canvas.width = 250;
            canvas.height = 125;

            // Get the canvas context
            var ctx = canvas.getContext("2d");

            // Set the font and text baseline
            ctx.font = "16px Georgia";
            ctx.textBaseline = "top";

            // To change the color on the rectangle, just manipulate the context
            ctx.strokeStyle = "rgb(255, 255, 255)";
            ctx.fillStyle = "rgb(0, 0, 0)";
            ctx.beginPath();
            ctx.roundRect(3, 3, canvas.width - 5, canvas.height - 5, 10);
            ctx.stroke();
            ctx.fill();

            ctx.beginPath();
            // Set the fill color to white
            ctx.fillStyle = "#FFFFFF";

            // Draw the text on the canvas
            ctx.fillText("Number of chords: " + numChords, 10, 10);
            ctx.fillText("Number of unique words: " + numUniqueChords, 10, 30);

            // Set the font for the label text
            ctx.font = "12px Georgia";

            // Measure the label text
            var labelText = "Generated with CharaChorder-utilities";
            var labelWidth = ctx.measureText(labelText).width;

            ctx.fillStyle = "#666";

            // Draw the label text at the bottom right corner of the canvas
            ctx.fillText(labelText, canvas.width - labelWidth - 10, canvas.height - 20);

            // Set the chart area width and height
            const chartWidth = 125;
            const chartHeight = 25;
            const labelHeight = 10; // height of the label area below the chart
            const columnSpacing = 2; // space between columns

            // Calculate the maximum count value
            const maxCount = Math.max(...counts);

            // Calculate the column width based on the number of columns and column spacing
            const columnWidth = (chartWidth - (counts.length - 1) * columnSpacing) / counts.length;

            // Set the starting x and y positions for the columns
            let xPos = 100;
            let yPos = canvas.height - 50;

            ctx.font = "12px monospace";
            ctx.fillStyle = "white";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillText("Chord length", 5, yPos + labelHeight / 2);
            ctx.textAlign = "center";
            // Iterate through the counts and draw the columns
            for (let i = 0; i < counts.length; i++) {
                // Calculate the column height based on the count value and the maximum count
                const columnHeight = (counts[i] / maxCount) * chartHeight;

                // Draw the column
                ctx.fillRect(xPos, yPos - columnHeight, columnWidth, columnHeight);

                // Draw the label below the column
                ctx.fillText(xAxis[i], xPos + columnWidth / 2, yPos + labelHeight / 2);

                // Increment the x position for the next column
                xPos += columnWidth;
            }

            return canvas;
        }

        // Function to handle clipboard operations
        const copyToClipboard = () => {
            const canvas = generateBannerContent(chordLibrary.length, uniqueChordOutputs.size, chordStats);
            canvas.toBlob((blob) => {
                const item = new ClipboardItem({ "image/png": blob });
                navigator.clipboard.write([item]).then(() => {
                    handleOpenSnackbar();  // Open Snackbar on successful clipboard write
                });
            });
        };

        // Function to draw on canvas
        const drawOnCanvas = () => {
            const canvas = generateBannerContent(chordLibrary.length, uniqueChordOutputs.size, chordStats);
            const ctx = currentCanvasRef.getContext('2d');
            ctx.clearRect(0, 0, currentCanvasRef.width, currentCanvasRef.height);
            ctx.drawImage(canvas, 0, 0);
        };

        // Attach click event for clipboard operations
        currentCanvasRef.addEventListener("click", copyToClipboard);

        // Draw on canvas
        drawOnCanvas();

        // Cleanup
        return () => {
            currentCanvasRef.removeEventListener("click", copyToClipboard);
        };
    }, [chordLibrary, uniqueChordOutputs, chordStats]);

    return (
        <div>
            <Typography>Click image to copy to clipboard</Typography>
            <canvas ref={canvasRef} width="250" height="125" style={{cursor: 'pointer'}} ></canvas>
            <Typography>Duplicate Words ({dupWords.length}): {dupWords.join(', ')}</Typography>
            <br />
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell style={{ fontWeight: 'bold' }}>Chord Lengths</TableCell>
                            <TableCell style={{ fontWeight: 'bold' }}>Count</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.keys(chordStats).map((length) => (
                            <TableRow key={length}>
                                <TableCell>{length} key chord</TableCell>
                                <TableCell>{chordStats[length]}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <br />
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell style={{ fontWeight: 'bold' }}>Letter/Key</TableCell>
                            <TableCell style={{ fontWeight: 'bold' }}>Count</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {letterCounts.map(([letter, count], index) => (
                            <TableRow key={index}>
                                <TableCell>{letter}</TableCell>
                                <TableCell>{count}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={openSnackbar}
                autoHideDuration={2000}
                onClose={handleCloseSnackbar}
            >
                <Alert onClose={handleCloseSnackbar} severity="success">
                    Copied to clipboard!
                </Alert>
            </Snackbar>
        </div>
    );
}

export default ChordStatistics;
