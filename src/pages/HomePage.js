import { Typography } from '@mui/material';
import React from 'react';

function HomePage() {
    return (
        <div>
            <Typography variant="h4">Welcome to CharaChorder Utilites!</Typography>
            <Typography variant="body1">
                This site contains a collection of tools for <a href="https://www.charachorder.com/">CharaChorder</a> users.
            </Typography>
            <Typography variant="body1">
                Most of the chord and practice tools require you to upload your exported chord library from Dot I/O.  You can do that in the top right hand corner.  After you have done it once, you will only need to load it again if you have added chords.
            </Typography>
            <Typography variant="body1">
                Explore each of the pages and report any issues on the <a href="https://github.com/typing-tech/CharaChorder-utilities">GitHub Page</a>.
            </Typography>
            <Typography variant="subtitle" color="error">
                Disclaimer: This site is not affiliated, associated, authorized, endorsed by, or in any way officially connected with CharaChorder. The official CharaChorder website can be found at <a href="https://www.charachorder.com/">CharaChorder.com</a>.
            </Typography>
        </div>
    );
}

export default HomePage;