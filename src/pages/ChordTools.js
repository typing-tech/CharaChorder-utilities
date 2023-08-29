import React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ChordDiagnostic from '../components/ChordDiagnostic';
import ChordStatistics from '../components/ChordStatistics';
import CC1ChordGenerator from '../components/CC1ChordGenerator';
import ChordViewer from '../components/ChordViewer';

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

function ChordTools({ chordLibrary = [], setChordLibrary }) {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Chord Tools
            </Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="Chord tools">
                    <Tab label="Chord Viewer" {...a11yProps(0)} />
                    <Tab label="Chord Statistics" {...a11yProps(1)} />
                    <Tab label="CC1 Chord Generator" {...a11yProps(2)} />
                    <Tab label="Chord Timing Diagnostic Tool" {...a11yProps(3)} />
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
                <ChordViewer chordLibrary={chordLibrary} setChordLibrary={setChordLibrary} />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <ChordStatistics chordLibrary={chordLibrary}/>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
                <CC1ChordGenerator chordLibrary={chordLibrary}/>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={3}>
                <ChordDiagnostic />
            </CustomTabPanel>
        </div>
    );
}

export default ChordTools;