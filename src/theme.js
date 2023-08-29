import { red } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

// A custom theme for this app
const theme = createTheme({
    palette: {
        primary: {
            main: '#272D2D',
        },
        secondary: {
            main: '#A39BA8',
        },
        error: {
            main: red.A400,
        },
    },
});

export default theme;