import React, { useState, useEffect, useRef } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableRow, TextField, Button,
    Select, MenuItem, Slider, Typography, FormControlLabel, Switch, Divider, Box,
    InputAdornment
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import { generateChords } from '../functions/chordGeneration'
import Papa from 'papaparse';
import english500 from '../words/english-500.json';
import english1000 from '../words/english-1000.json';
import english5000 from '../words/english-5000.json';

function CC1ChordGenerator({ chordLibrary }) {
    const [createdChords, setCreatedChords] = useState({});
    const [inputWords, setInputWords] = useState('');
    const [sliderValue, setSliderValue] = useState([3, 6]);
    const [checkboxStates, setCheckboxStates] = useState({
        useDupKey: true,
        useMirroredKeys: true,
        useAltKeys: false,
        use3dKeys: false,
        createCsv: false,
    });

    // CSV state
    const [csvWords, setCsvWords] = useState([]);
    const [numRowsToUse, setNumRowsToUse] = useState(0);
    const [isFileUploaded, setIsFileUploaded] = useState(false);
    const handleCsvUpload = (e) => {
        const file = e.target.files[0];
        Papa.parse(file, {
            complete: function (results) {
                const wordsFromCsv = results.data.map(row => row[0]).filter(Boolean);
                console.log(wordsFromCsv)
                setCsvWords(wordsFromCsv);
                setIsFileUploaded(true);
            }
        });
    };
    const fileInputRef = useRef(null);

    // Word set dropdown state
    const [selectedWordSet, setSelectedWordSet] = useState(null);

    const clearCsv = () => {
        setNumRowsToUse(0);
        setCsvWords([]);
        setIsFileUploaded(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };

    const handleChange = (e) => {
        setInputWords(e.target.value);
    };

    const clearInput = () => {
        setInputWords('');
    };

    const handleSliderChange = (event, newValue) => {
        setSliderValue(newValue);
    };

    const handleCheckboxChange = (event) => {
        setCheckboxStates({
            ...checkboxStates,
            [event.target.name]: event.target.checked,
        });
    };

    const handleClick = async () => {
        const wordsArray = csvWords.length > 0 ? csvWords.slice(0, numRowsToUse) : inputWords.split(',').map(word => word.trim());
        const generatedChords = await generateChords(wordsArray, sliderValue, checkboxStates, chordLibrary);
        setCreatedChords(generatedChords);
    };

    const wordSets = {
        'english500': english500.words,
        'english1000': english1000.words,
        'english5000': english5000.words,
    };

    useEffect(() => {
        setNumRowsToUse(Math.min(200, csvWords.length));
        if (wordSets[selectedWordSet]) {
            setInputWords(wordSets[selectedWordSet].join(', '));
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [csvWords, selectedWordSet ]);

    const createdChordsArray = Object.entries(createdChords);

    return (
        <div>
            <Typography style={{ margin: '10px 0' }}>
                Either upload a .csv file that has words sorted by importance in the first column (such as a CharaChorder Nexus export),
                type words separated by commas, or choose from a predetermined set of word lists. Note: using the word lists can take
                quite a bit of time, so you may have to wait a few minutes.
            </Typography>
            <Box display="flex" flexDirection="row" alignItems="center" gap="20px">
                <Button variant="contained" component="label">
                    {isFileUploaded ? "File uploaded!" : "Upload CSV"}
                    <input type="file" accept=".csv" hidden onChange={handleCsvUpload} ref={fileInputRef} />
                </Button>
                {csvWords.length > 0 && (
                    <>
                        <Typography>{csvWords.length} words loaded. How many do you want to generate chords for?</Typography>
                        <TextField
                            type="number"
                            label="Use x words"
                            value={numRowsToUse}
                            onChange={(e) => setNumRowsToUse(Number(e.target.value))}
                            InputProps={{
                                inputProps: {
                                    min: 0,
                                    max: csvWords.length
                                }
                            }}
                        />
                        <Button variant="contained" color="secondary" onClick={clearCsv}>
                            Clear File
                        </Button>
                    </>


                )}
            </Box>

            {csvWords.length === 0 && (
                <>
                    <Typography style={{ margin: '10px 0' }}>
                        - or -
                    </Typography>
                    <TextField
                        style={{ width: '50%' }}
                        label="Enter words to create chords for"
                        variant="outlined"
                        value={inputWords}
                        onChange={handleChange}
                        fullWidth
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={clearInput}>
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </>
            )}

            <Select
                value={selectedWordSet}
                onChange={(e) => setSelectedWordSet(e.target.value)}
                displayEmpty
            >
                <MenuItem value="" disabled>
                    Select a word set
                </MenuItem>
                <MenuItem value="english500">Top 500 English Words</MenuItem>
                <MenuItem value="english1000">Top 1000 English Words</MenuItem>
                <MenuItem value="english5000">Top 5000 English Words</MenuItem>
            </Select>

            <Divider style={{ margin: '20px 0' }}></Divider>
            <Typography gutterBottom>Select number of keys for the chord inputs</Typography>
            <Slider
                style={{ width: '50%' }}
                value={sliderValue}
                onChange={handleSliderChange}
                valueLabelDisplay="auto"
                min={1}
                max={10}
            />
            <Typography id="selected-values">Selected range: {sliderValue[0]} - {sliderValue[1]}</Typography>
            <div id="toggles">
                {["useDupKey", "useMirroredKeys", "useAltKeys", "use3dKeys", "createCsv"].map((key) => (
                    <FormControlLabel
                        control={
                            <Switch
                                checked={checkboxStates[key]}
                                onChange={handleCheckboxChange}
                                name={key}
                            />
                        }
                        label={key.replace(/([a-z0-9])([A-Z])/g, '$1 $2')}
                        key={key}
                    />
                ))}
            </div>
            <Button variant="contained" color="primary" onClick={handleClick}>
                Generate Chords
            </Button>
            <Table style={{ width: '50%' }}>
                <TableHead>
                    <TableRow>
                        <TableCell>Word</TableCell>
                        <TableCell>Chord</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {createdChordsArray.map(([word, chord], index) => {
                        return (
                            <TableRow key={index}>
                                <TableCell>{word}</TableCell>
                                <TableCell>{chord.join(' + ')}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div >
    );
}

export default CC1ChordGenerator;
