import React, { useState, useEffect } from 'react';
import { Typography, Button, TextField } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { Snackbar, Alert } from '@mui/material';

function CCX() {
    const [port, setPort] = useState(null);
    const [writer, setWriter] = useState(null);
    const [isTesting, setIsTesting] = useState(false);
    const [receivedData, setReceivedData] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [supportsSerial, setSupportsSerial] = useState(null);

    const handleOpenSnackbar = () => {
        setOpenSnackbar(true);
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    useEffect(() => {
        if (port !== null) {
            listenToPort();
        }
    }, [port]);

    useEffect(() => {
        if ('serial' in navigator) {
            setSupportsSerial(true)
        }
        else {
            setSupportsSerial(false)
        }
    })

    const connectDevice = async () => {
        try {
            const newPort = await navigator.serial.requestPort();
            await newPort.open({ baudRate: 115200 });

            const textEncoder = new TextEncoderStream();
            const writableStreamClosed = textEncoder.readable.pipeTo(newPort.writable);
            const newWriter = textEncoder.writable.getWriter();

            setWriter(newWriter);
            setPort(newPort);
        } catch {
            alert("Serial Connection Failed");
        }
    };

    const listenToPort = async () => {
        if (port === null) return;

        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
        const reader = textDecoder.readable.getReader();

        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                reader.releaseLock();
                break;
            }
            setReceivedData((prev) => prev + value);
        }
    };

    const toggleTest = async () => {
        if (!isTesting) {
            if (writer) {
                const dataToSend = "VAR B2 C1 1\r\n";
                await writer.write(dataToSend);
            }
            setIsTesting(true);
        } else {
            if (writer) {
                const dataToSend = "VAR B2 C1 0\r\n";
                await writer.write(dataToSend);
            }
            setIsTesting(false);
            copyToClipboard()
        }
    };

    const copyToClipboard = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(receivedData);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = receivedData;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
        handleOpenSnackbar();
    };

    return (
        <div>
            <Typography variant="h4">CharaChorder X Debugging</Typography>
            {supportsSerial === null ? (
                "Checking for Serial API support..."
            ) : supportsSerial ? (
                <>
                    <Typography>
                        In order to help the CharaChorder team debug why your
                        keyboard may not be working with the CCX, please perform the following
                        steps and then copy and send the output once you are done.
                        Read all instructions first before starting with step 1.
                    </Typography>
                    <List>
                        <ListItem>
                            1: Click "Connect" and use Chrome's serial connection to
                            choose your CCX.  Click "Start Test" (you should see a
                            "VAR") line appear in the Serial Data box.
                        </ListItem>
                        <ListItem>2: Press and release the letter "a".</ListItem>
                        <ListItem>
                            3: Next, press and hold the letter "a", press and hold the letter "s", and keep 
                            adding one letter at a time until you are pressing and holding all keys in "asdfjkl;" and
                            then release all at once. Make sure to press the keys in order.
                        </ListItem>
                        <ListItem>4: Press and release the "Left Shift" key.  </ListItem>
                        <ListItem>
                            5: Press the "Left Shift" key, press "Left Alt" key,
                            and then release both.
                        </ListItem>
                        <ListItem>
                            6: Press the "a" key, press "Left Shift" key, and
                            then release both.
                        </ListItem>
                        <ListItem>
                            7: Click Stop Test. The results are copied to your clipboard. You can
                            send this to your CharaChorder support rep.
                        </ListItem>
                    </List>
                    <Button variant="contained" onClick={connectDevice}>Connect</Button>
                    <Button variant="contained" onClick={toggleTest}>
                        {isTesting ? 'STOP TEST' : 'START TEST'}
                    </Button>
                    <Typography variant="h6">Serial Data:</Typography>
                    <TextField
                        label="Response"
                        variant="outlined"
                        multiline
                        rows={4}
                        fullWidth
                        value={receivedData}
                    />
                    <Snackbar
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        open={openSnackbar}
                        autoHideDuration={2000}
                        onClose={handleCloseSnackbar}
                    >
                        <Alert onClose={handleCloseSnackbar} severity="success">
                            Copied to clipboard!
                        </Alert>
                    </Snackbar>
                    <Typography variant="h6">What is this test doing?</Typography>
                    <Typography>
                        When keyboard manufacturers make a keyboard that is plug and play,
                        they have a few formatting options when it comes time to actually send what
                        you, the user, type on your keyboard to your computer. There
                        is a standard format that most keyboards use and the
                        CCX works out of the box with that one (boot protocol); however,
                        there are others that may be non-standard and when this
                        happens, your CCX may not work properly.
                        This test turns on a debugging command and then records
                        the outputs from your device as you press various keys.
                        The codes you see in the box are the codes that your
                        keyboard is sending to the CharaChorder X and then the
                        CharaChorder X has to interpet what it is, do its own
                        processing/magic of chording and then send on to the
                        computer the right text.  If your keyboard isn't sending,
                        for example, "KYBRPT 00 0000040000000000" for the
                        letter "a", this test will let CharaChorder support see what it IS sending
                        and then they may be able to infer/make a game plan to support
                        what your keyboard is sending.
                    </Typography>
                </>
            ) : (
                <Typography>
                    Your browser does not support the Serial API. Please use
                    Google Chrome, Microsoft Edge, or another <a className="underline" href="https://caniuse.com/web-serial">browser
                        that supports the Serial API</a>  in order to use this tool.
                </Typography>
            )}
        </div>
    );
}

export default CCX;