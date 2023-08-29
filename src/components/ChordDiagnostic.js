import React, { useState, useRef, useEffect } from 'react';
import { Button, Container, TextField, Table, TableBody, TableCell, TableHead, TableRow, Typography, Box } from '@mui/material';
import 'vis-timeline/dist/vis-timeline-graph2d.min.css'; 
import './ChordDiagnostic.css';
import { DataSet } from "vis-data/peer";
import { Timeline } from "vis-timeline";

const TableRowComponent = ({ event, time, startTime }) => {
    const relativeTime = time - startTime;
    const eventType = event.type === 'keydown' ? 'Press' : 'Release';
    return (
        <TableRow>
            <TableCell>{eventType}</TableCell>
            <TableCell>{event.code}</TableCell>
            <TableCell>{relativeTime.toFixed(2) + ' ms'}</TableCell>
        </TableRow>
    );
};

const ChordDiagnostic = () => {
    const containerRef = useRef(null);
    const [events, setEvents] = useState([]);
    const [pressMessage, setPressMessage] = useState('');
    const [releaseMessage, setReleaseMessage] = useState('');
    const [pressToReleaseMessage, setPressToReleaseMessage] = useState('');
    const timelineRef = useRef(null);
    const [textFieldValue, setTextFieldValue] = useState('');
    const plotTimeoutRef = useRef(null);

    const handleKeyEvents = (event) => {
        setEvents([...events, { event, time: performance.now() }]);
        setTextFieldValue(event.target.value);

        if (plotTimeoutRef.current) {
            clearTimeout(plotTimeoutRef.current);
        }

        const delay = 500; 
        plotTimeoutRef.current = setTimeout(handlePlot, delay);
    };

    // Clear the timeout when the component is unmounted
    useEffect(() => {
        return () => {
            if (plotTimeoutRef.current) {
                clearTimeout(plotTimeoutRef.current);
            }
        };
    }, []);

    const handlePlot = () => {
        const container = containerRef.current;
        const initialTime = events[0].time; 

        const items = new DataSet(events.map(({ event, time }) => {
            const color = event.type === 'keyup' ? 'red' : 'green';
            const relativeTime = time - initialTime;
            return {
                content: event.code,
                start: relativeTime,
                title: `${relativeTime.toFixed(2)} ms`,
                style: `color: white`,
                className: color
            };
        }));

        const options = {
            orientation: 'top',
            align: 'left',
            order: (a, b) => b.time - a.time,
            showMajorLabels: false,
            format: {
                minorLabels: (date) => date.valueOf().toString(),
            }
        };

        // Clearing the previous timeline
        container.innerHTML = '';

        // Creating the new timeline
        const timeline = new Timeline(container, items, options);
        timelineRef.current = timeline;

        // Filter the events to only include those before the first Backspace
        const filteredEvents = [];
        for (const eventObj of events) {
            if (eventObj.event.code === 'Backspace') break; // Stop processing after the first Backspace
            filteredEvents.push(eventObj);
        }

        let firstPressTime = null;
        let lastPressTime = null;
        let firstReleaseTime = null;
        let lastReleaseTime = null;
        let pressToReleaseTime = null;

        filteredEvents.forEach(({ event, time }) => {
            if (event.type === 'keydown') {
                if (firstPressTime === null) {
                    firstPressTime = time;
                }
                lastPressTime = time;
            } else if (event.type === 'keyup') {
                if (firstReleaseTime === null) {
                    firstReleaseTime = time;
                }
                lastReleaseTime = time;
            }
        });

        const pressDifference = lastPressTime !== null && firstPressTime !== null
            ? (lastPressTime - firstPressTime).toFixed(2) + ' ms'
            : 'N/A';

        const releaseDifference = lastReleaseTime !== null && firstReleaseTime !== null
            ? (lastReleaseTime - firstReleaseTime).toFixed(2) + ' ms'
            : 'N/A';

        if (lastPressTime !== null && firstReleaseTime !== null) {
            pressToReleaseTime = (firstReleaseTime - lastPressTime).toFixed(2) + ' ms';
        } else {
            pressToReleaseTime = 'N/A';
        }

        // Setting messages
        setPressMessage('The time between the first and last press was ' + pressDifference + '.');
        setReleaseMessage('The time between the first and last release was ' + releaseDifference + '.');
        setPressToReleaseMessage('The time between the last press and the first release was ' + pressToReleaseTime + '.');
    };

    const handleReset = () => {
        if (timelineRef.current) {
            timelineRef.current.destroy(); // Destroy the timeline instance
        }
        setEvents([]);
        setPressMessage('');
        setReleaseMessage('');
        setTextFieldValue('');
        setPressToReleaseMessage('');
    };

    return (
        <Container>
            <header></header>
            <div className="main-content">
                <Typography>
                    This tool is designed to help you look at the press and release timings of a chord.
                    To use, try to chord the word in the input box and then shortly after it will be plotted. 
                    There is also a table of the presses and releases. 
                    Credit to Tangent Chang (andy23512) from the CharaChorder Discord for this tool.
                </Typography>
                <div id="wrapper">
                    <div id="controls">
                        <Box display="flex" flexDirection="row" alignItems="center" gap="5px" margin="5px">
                            <TextField
                                type="text"
                                value={textFieldValue}
                                onChange={(e) => setTextFieldValue(e.target.value)}
                                onKeyUp={handleKeyEvents}
                                onKeyDown={handleKeyEvents}
                            />
                            <Button variant="contained" type="button" onClick={handleReset}>Reset</Button>
                        </Box>
                    </div>
                    <div id="visualization" ref={containerRef}></div>
                </div>
                <div id="timing-messages">
                    <Typography margin="10px 0px 0px 0px">{pressMessage}</Typography>
                    <Typography>{releaseMessage}</Typography>
                    <Typography gutterBottom>{pressToReleaseMessage}</Typography>
                </div>
                <div id="table-container">
                    <Table id="timing-table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Event</TableCell>
                                <TableCell>Code</TableCell>
                                <TableCell>Time</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {events.map((eventData, index) => (
                                <TableRowComponent
                                    key={index}
                                    event={eventData.event}
                                    time={eventData.time}
                                    startTime={events[0]?.time || 0}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </Container>
    );
};

export default ChordDiagnostic;
