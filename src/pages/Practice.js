import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    TextField, Typography, Grid, Slider, Button,
    Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import './Practice.css';


function Practice({ chordLibrary }) {
    const [targetChords, setTargetChords] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [correctInput, setCorrectInput] = useState(null);
    const [sliderKeyValue, setSliderKeyValue] = useState([2, 10]);
    const [filteredChords, setFilteredChords] = useState([]);
    const [chordStats, setChordStats] = useState({});
    const [shouldUpdateChords, setShouldUpdateChords] = useState(true);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [timerSeconds, setTimerSeconds] = useState(2 * 60);
    const [customTime, setCustomTime] = useState(2);
    const [timerActive, setTimerActive] = useState(false);
    const [totalTimePracticed, setTotalTimePracticed] = useState(0);

    const inputRef = useRef(null);

    const numberOfTargetChords = 10;
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
    };

    const handleKeySliderChange = (event, newValue) => {
        setSliderKeyValue(newValue);
    };

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
        const newTime = parseInt(e.target.value, 10);
        setCustomTime(newTime);
        setTimerSeconds(newTime * 60);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
        }

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

    useEffect(() => {
        updateTargetChords();
    }, [updateTargetChords]);

    useEffect(() => {
        const newFilteredChords = chordLibrary.filter(chord => {
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
    }, [chordLibrary, sliderKeyValue]);

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
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerInterval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timerActive]);

    const sortedChords = Object.keys(chordStats)
        .map(chord => ({
            chord,
            ...chordStats[chord]
        }))
        .sort((a, b) => (b.attempt - b.correct) - (a.attempt - a.correct));

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
                    <Typography>
                        All time statistics: {formattedTime}
                    </Typography>
                </Grid>
            </Grid>
            {
                chordLibrary.length > 0 ? (
                    <>
                        <Grid
                            container
                            direction="row"
                            spacing={20}
                        >
                            <Grid item xs={6}>
                                <TextField
                                    type="number"
                                    label="How long to practice (minutes)"
                                    value={customTime}
                                    onChange={handleCustomTimeChange}
                                    InputProps={{
                                        inputProps: {
                                            min: 0,
                                            max: 60
                                        }
                                    }}
                                    disabled={timerActive}
                                    style={{ width: "50%" }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography>
                                    Practicing {filteredChords.length} chords with {sliderKeyValue[0]} - {sliderKeyValue[1]} keys
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

                        {timerSeconds <= 0 && (
                            <>

                                <Button variant="contained" onClick={resetState}>Start a new practice session</Button>
                                <Typography>{sortedChords.length} chords practiced</Typography>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Chord</TableCell>
                                            <TableCell align="right">Attempts</TableCell>
                                            <TableCell align="right">Correct</TableCell>
                                            <TableCell align="right">Percentage</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sortedChords.map(({ chord, attempt, correct }) => {
                                            const percentage = (attempt === 0) ? 0 : ((correct / attempt) * 100).toFixed(0);
                                            return (
                                                <TableRow key={chord}>
                                                    <TableCell component="th" scope="row">
                                                        {chord}
                                                    </TableCell>
                                                    <TableCell align="right">{attempt}</TableCell>
                                                    <TableCell align="right">{correct}</TableCell>
                                                    <TableCell align="right">{percentage}%</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
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
