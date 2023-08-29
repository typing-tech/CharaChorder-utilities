import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, FormControlLabel, Checkbox, Box } from '@mui/material';

function ChordViewer({ chordLibrary = [] }) {
    const [filterText, setFilterText] = useState('');  
    const [filteredChords, setFilteredChords] = useState(chordLibrary);
    const [showDuplicates, setShowDuplicates] = useState(false);


    useEffect(() => {
        const trimmedFilterText = filterText.trim();
        let filtered = chordLibrary.filter(chord => {
            const input = chord.chordInput ? chord.chordInput.toLowerCase() : '';
            const output = chord.chordOutput ? chord.chordOutput.toLowerCase() : '';
            return input.includes(trimmedFilterText.toLowerCase()) || output.includes(trimmedFilterText.toLowerCase());
        });

        if (showDuplicates) {
            const outputCount = new Map();
            filtered.forEach(chord => {
                const output = chord.chordOutput ? chord.chordOutput.toLowerCase() : '';
                outputCount.set(output, (outputCount.get(output) || 0) + 1);
            });

            filtered = filtered.filter(chord => {
                const output = chord.chordOutput ? chord.chordOutput.toLowerCase() : '';
                return outputCount.get(output) > 1;
            });

            filtered.sort((a, b) => {
                if (a.chordOutput < b.chordOutput) {
                    return -1;
                }
                if (a.chordOutput > b.chordOutput) {
                    return 1;
                }
                return 0;
            });
        }



        setFilteredChords(filtered);
    }, [chordLibrary, filterText, showDuplicates]);

    return (
        <div>
            {
                chordLibrary.length > 0 ? (
                    <>
                        <Box display="flex" flexDirection="row" alignItems="center" gap="20px">
                            <TextField
                                id="filter"
                                label="Filter"
                                variant="outlined"
                                placeholder="Search chords..."
                                value={filterText}
                                onChange={e => setFilterText(e.target.value)}
                            />
                            <FormControlLabel  // Checkbox component
                                control={
                                    <Checkbox
                                        checked={showDuplicates}
                                        onChange={() => setShowDuplicates(!showDuplicates)}
                                    />
                                }
                                label="Show only duplicates"
                            />
                        </Box>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Chord Input</TableCell>
                                    <TableCell>Chord Output</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredChords.map((chord, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{chord.chordInput}</TableCell>
                                        <TableCell>{chord.chordOutput}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </>
                ) : (
                    <Typography variant="h6">
                        Please load your chord library in settings.
                    </Typography>
                )
            }
        </div>
    );
}

export default ChordViewer;