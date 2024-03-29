import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TextField, Typography, Grid, Slider, Button, Dialog, DialogContent, DialogActions} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

import { DataGrid } from '@mui/x-data-grid';
import './Practice.css';


function Practice({ chordLibrary }) {
    const [targetChords, setTargetChords] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [correctInput, setCorrectInput] = useState(null);
    const [sliderKeyValue, setSliderKeyValue] = useState([2, 10]);
    const [chordIndexValue, setChordIndexValue] = useState([1,chordLibrary.length]);
    const [filteredChords, setFilteredChords] = useState([]);
    const [chordStats, setChordStats] = useState({});
    const [shouldUpdateChords, setShouldUpdateChords] = useState(true);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [timerSeconds, setTimerSeconds] = useState(1 * 60);
    const [customTime, setCustomTime] = useState(1);
    const [timerActive, setTimerActive] = useState(false);
    const [totalTimePracticed, setTotalTimePracticed] = useState(0);
    const [openDialog, setOpenDialog] = React.useState(false);

    const inputRef = useRef(null);

    const numberOfTargetChords = 5;
    const uncheckable_keys = [
        'bksp', 'deldel', ' ', 'enter', 'lflf', 'rtrt',
        'esc', 'arrow_up', 'arrow_dn', 'arrow_left', 'arrow_rt',
        'pageup', 'pagedown', 'scrolllock', 'capslock', 'numlock', 'f1',
        'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f11', 'f12'
    ];
    const wordPattern = /\S+/g;


    const resetState = () => {
        setTargetChords([]);
        setUserInput("");
        setCorrectInput(null);
        setSliderKeyValue([2, 10]);
        setFilteredChords([]);
        setChordStats({});
        setShouldUpdateChords(true);
        setCurrentWordIndex(0);
        setTimerSeconds(customTime * 60);
        setTimerActive(false);
        if (inputRef.current) {
            inputRef.current.disabled = false;
            inputRef.current.focus();
        }
    };

    const handleKeySliderChange = (event, newValue) => {
        setSliderKeyValue(newValue);
    };

    const handleChordIndexChange = (event, newValue) => {
        setChordIndexValue(newValue);
    }

    const updateTotalTimePracticed = (time) => {
        const newTotalTime = totalTimePracticed + time;
        setTotalTimePracticed(newTotalTime);
        localStorage.setItem('totalTimePracticed', newTotalTime);
    };

    const handleInputChange = (e) => {
        if (!timerActive) {
            setTimerActive(true);
        }
        setUserInput(e.target.value);
    };

    const handleCustomTimeChange = (e) => {
        const newTime = parseFloat(e.target.value);
        setCustomTime(newTime);
        setTimerSeconds(newTime * 60);
    };

    const handleKeyDown = (e) => {
        if (targetChords?.[0]) {
            let newChordStats = { ...chordStats };
            const firstChordOutput = targetChords[0].chordOutput;

            if (e.key === 'Enter' || e.key === ' ') {
                const userInputWords = userInput.match(wordPattern);
                const targetWords = firstChordOutput.match(wordPattern);

                if (
                    userInputWords && targetWords &&
                    userInputWords.join(' ') === targetWords[currentWordIndex]
                ) {
                    if (currentWordIndex === targetWords.length - 1) {
                        let newTargetChords = targetChords.slice(1);
                        const randomIndex = Math.floor(Math.random() * filteredChords.length);
                        newTargetChords.push(filteredChords[randomIndex]);
                        setTargetChords(newTargetChords);
                        setCurrentWordIndex(0);
                    } else {
                        setCurrentWordIndex(currentWordIndex + 1);
                    }

                    setUserInput("");
                    setCorrectInput(null);

                    newChordStats[firstChordOutput] = newChordStats[firstChordOutput] || { attempt: 0, correct: 0 };
                    newChordStats[firstChordOutput].attempt++;
                    newChordStats[firstChordOutput].correct++;

                } else {
                    setCorrectInput(targetChords[0].chordInput);
                    newChordStats[firstChordOutput] = newChordStats[firstChordOutput] || { attempt: 0, correct: 0 };
                    newChordStats[firstChordOutput].attempt++;
                }

                setChordStats(newChordStats);
            }
        }
    };

    const isValidChord = (chord) => {
        if (!chord.chordInput) return false;

        const chordArray = chord.chordInput
            .split('+')
            .map(str => str.trim().toLowerCase());

        return chordArray.every(input => !uncheckable_keys.includes(input));
    };

    const updateTargetChords = useCallback(() => {
        if (!shouldUpdateChords) return;
        if (filteredChords.length === 0) return;

        let newTargetChords = [];

        for (let i = 0; i < numberOfTargetChords; i++) {
            if (filteredChords.length === 0) break;

            const randomIndex = Math.floor(Math.random() * filteredChords.length);
            const chord = filteredChords?.[randomIndex];
            if (!chord) break;

            newTargetChords.push(chord);
        }

        setTargetChords(newTargetChords);
        setShouldUpdateChords(false);
    }, [filteredChords, shouldUpdateChords]);

    const clearTotalTimePracticed = () => {
        localStorage.removeItem('totalTimePracticed');
        setTotalTimePracticed(0);
        handleDialogClose();
    };

    useEffect(() => {
        updateTargetChords();
    }, [updateTargetChords]);

    useEffect(() => {
        const slicedChordLibrary = chordLibrary.slice(chordIndexValue[0]-1,chordIndexValue[1]-1);
        const newFilteredChords = slicedChordLibrary.filter(chord => {
            const chordLength = chord.chordInput.split('+').length;
            return chordLength >= sliderKeyValue[0] && chordLength <= sliderKeyValue[1];
        });
        let validChords = newFilteredChords.filter(isValidChord);
        setFilteredChords(validChords);
        
        if (validChords.length > 0) {
            setShouldUpdateChords(true);
            updateTargetChords();
        }

        setCorrectInput(null);
        setChordStats({});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chordLibrary, sliderKeyValue, chordIndexValue]);

    useEffect(() => {
        resetState();
        const storedTotalTime = localStorage.getItem('totalTimePracticed');
        if (storedTotalTime) {
            setTotalTimePracticed(parseInt(storedTotalTime, 10));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        let timerInterval;
        if (timerActive) {
            timerInterval = setInterval(() => {
                setTimerSeconds(prev => {
                    if (prev <= 1) {
                        clearInterval(timerInterval);
                        setTimerActive(false);
                        updateTotalTimePracticed(customTime * 60);
                        if (inputRef.current) {
                            inputRef.current.disabled = true;
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerInterval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timerActive]);

    const handleDialogOpen = () => {
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
    };


    const sortedChords = Object.keys(chordStats)
        .map(chord => ({
            chord,
            ...chordStats[chord]
        }))
        .sort((a, b) => (b.attempt - b.correct) - (a.attempt - a.correct));

    const columns = [
        { field: 'chord', headerName: 'Chord', width: 150 },
        { field: 'attempt', headerName: 'Attempts', type: 'number', width: 150 },
        { field: 'correct', headerName: 'Correct', type: 'number', width: 150 },
        {
            field: 'percentage',
            headerName: 'Percentage',
            type: 'number',
            width: 150,
            valueFormatter: (params) => {
                if (params.value == null) {
                    return '';
                }
                return `${params.value.toLocaleString()} %`;
            } }
    ];

    const rows = sortedChords.map(({ chord, attempt, correct }, index) => {
        const percentage = (attempt === 0) ? 0 : ((correct / attempt) * 100).toFixed(0);
        return {
            id: index,
            chord,
            attempt,
            correct,
            percentage
        };
    });

    const formatTotalTime = (totalSeconds) => {
        const secondsInADay = 86400;
        const secondsInAnHour = 3600;
        const secondsInAMinute = 60;

        const days = Math.floor(totalSeconds / secondsInADay);
        let remainingSeconds = totalSeconds % secondsInADay;

        const hours = Math.floor(remainingSeconds / secondsInAnHour);
        remainingSeconds = remainingSeconds % secondsInAnHour;

        const minutes = Math.floor(remainingSeconds / secondsInAMinute);

        // Build the formatted time string conditionally
        let formattedTime = "";

        if (days > 0) {
            formattedTime += `${days} days, `;
        }

        if (totalSeconds >= secondsInAnHour) {
            formattedTime += `${hours} hours, `;
        }

        formattedTime += `${minutes} minutes`;

        return formattedTime;
    };

    const formattedTime = formatTotalTime(totalTimePracticed);

    return (
        <div>
            <Grid container alignItems="center" justify="space-between">
                <Grid item xs={6}>
                    <Typography variant="h4" gutterBottom>
                        Practice
                    </Typography>
                </Grid>
                <Grid item xs={6} style={{ textAlign: 'right' }}>
                    <Typography display="inline">
                        All time statistics: {formattedTime}
                    </Typography>
                    <IconButton onClick={handleDialogOpen} edge="end">
                        <DeleteIcon />
                    </IconButton>

                    <Dialog open={openDialog} onClose={handleDialogClose}>
                        <DialogContent>
                            Do you really want to clear all time statistics?
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleDialogClose} color="primary">
                                Cancel
                            </Button>
                            <Button
                                onClick={clearTotalTimePracticed}
                                color="primary"
                            >
                                Clear
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Grid>
            </Grid>
            {
                chordLibrary.length > 0 ? (
                    <>
                        <Grid
                            container
                            direction="row"
                            spacing={10}
                        >
                            <Grid item xs={4}>
                                <TextField
                                    type="number"
                                    label="How long to practice (minutes)"
                                    value={customTime}
                                    onChange={handleCustomTimeChange}
                                    InputProps={{
                                        inputProps: {
                                            min: 0.1,
                                            max: 60,
                                            step: 0.1
                                        }
                                    }}
                                    disabled={timerActive}
                                    style={{ width: "100%" }}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <Typography>
                                    Choose chords to practice: {chordIndexValue[0]} to {chordIndexValue[1]}
                                </Typography>
                                <Slider
                                    id="chord-index-keys"
                                    value={chordIndexValue}
                                    onChange={handleChordIndexChange}
                                    valueLabelDisplay="auto"
                                    min={1}
                                    max={chordLibrary.length}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <Typography>
                                    Filter chords by number of keys: {filteredChords.length} chords have {sliderKeyValue[0]} - {sliderKeyValue[1]} keys
                                </Typography>
                                <Slider
                                    id="slider-range-keys"
                                    value={sliderKeyValue}
                                    onChange={handleKeySliderChange}
                                    valueLabelDisplay="auto"
                                    min={2}
                                    max={10}
                                />
                            </Grid>
                        </Grid>
                        <Grid
                            container
                            direction="column"
                            justifyContent="start"
                            alignItems="left"
                        >
                            {
                                filteredChords.length === 0 ? (
                                    <Typography variant="body1" color="error">
                                        No chords available for the selected range.
                                    </Typography>
                                ) : (
                                    Array.isArray(targetChords) && targetChords.length > 0 ? (
                                        <div>
                                            <Grid
                                                container
                                                direction="row"
                                                justifyContent="start"
                                                alignItems="left"
                                                spacing={2}
                                            >
                                                {targetChords.map((chord, index) => (
                                                    <Grid item key={index}>
                                                        <Typography
                                                            variant="h5"
                                                            style={{ color: index === 0 ? 'green' : 'grey' }}
                                                            gutterBottom
                                                        >
                                                            {chord?.chordOutput ?? "N/A"}
                                                        </Typography>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </div>

                                    ) : (
                                        <Typography variant="body1" color="error">
                                            No target chords are available.
                                        </Typography>
                                    )
                                )
                            }
                            <TextField
                                inputRef={inputRef}
                                value={userInput}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                label="Your Input"
                                disabled={timerSeconds===0}
                            />
                            {correctInput && (
                                <Typography variant="body1" color="error">
                                    The correct input is: {correctInput}
                                </Typography>
                            )}
                        </Grid>

                        {timerActive && (
                            <Typography
                                variant="h1"
                                color="textSecondary"
                            >
                                Time Remaining: {Math.floor(timerSeconds / 60)}:{timerSeconds % 60 < 10 ? '0' : ''}{timerSeconds % 60}
                            </Typography>
                        )}

                        {timerSeconds <= 0 && rows.length > 0 && (
                            <>
                                <Button variant="contained" onClick={resetState}>Start a new practice session</Button>
                                <Typography>{rows.length} chords practiced</Typography>
                                <div style={{ height: 600, width: '100%' }}>
                                    <DataGrid 
                                        rows={rows}
                                        columns={columns}
                                        pageSize={5}
                                    />
                                </div>
                            </>
                        )}

                    </>
                ) : (
                    <Typography variant="h6">
                        Please load your chord library in settings to get started.
                    </Typography>
                )
            }
        </div>
    );
}

export default Practice;
