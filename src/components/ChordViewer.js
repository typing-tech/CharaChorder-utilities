import React, { useState, useEffect } from 'react';
import { Typography, FormControlLabel, Checkbox, Box } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

function ChordViewer({ chordLibrary = [] }) {
    const [filteredChords, setFilteredChords] = useState(chordLibrary);
    const [showDuplicates, setShowDuplicates] = useState(false);


    useEffect(() => {
        let filtered = chordLibrary;

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
    }, [chordLibrary, showDuplicates]);

    const columns = [
        { field: 'id', headerName: 'Chord Index', width: 100},
        { field: 'chordInput', headerName: 'Chord Input', flex: 0.5 },
        { field: 'chordOutput', headerName: 'Chord Output', flex: 1}
    ];

    const rows = filteredChords.map((chord, index) => ({
        id: index+1,
        chordInput: chord.chordInput,
        chordOutput: chord.chordOutput
    }));

    return (
        <>
            {chordLibrary.length > 0 ? (
                <>
                    <Box display="flex" flexDirection="row" alignItems="center" gap="20px">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={showDuplicates}
                                    onChange={() => setShowDuplicates(!showDuplicates)}
                                />
                            }
                            label="Show only duplicates"
                        />
                    </Box>
                    <div style={{ height: 600, width: '100%' }}>
                        <DataGrid 
                            rows={rows}
                            columns={columns}
                            pageSize={5}
                            slots={{ toolbar: GridToolbar }}
                            slotProps={{
                                toolbar: {
                                    showQuickFilter: true,
                                },
                            }}
                        />
                    </div>
                </>
            ) : (
                <Typography variant="h6">
                    Please load your chord library in settings.
                </Typography>
            )}
        </>
    );
};

export default ChordViewer;