import * as React from 'react';
import { AppBar, Box, Toolbar, Typography, Menu, MenuItem, Container, Button, Tooltip } from '@mui/material';
import { Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Input } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardAltIcon from '@mui/icons-material/KeyboardAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import Papa from 'papaparse';
import { Link } from 'react-router-dom';

const pages = ['Word Tools', 'Chord Tools', 'Practice'];

function ButtonAppBar({ chordLibrary, setChordLibrary }) {
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const [openModal, setOpenModal] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState(null);
    const [chordInfoMessage, setChordInfoMessage] = React.useState(null);

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const parseChordsFromCSV = (file, callback) => {
        Papa.parse(file, {
            complete: function (results) {
                const chords = results.data.reduce((acc, row) => {
                    if (row.length >= 2) {
                        let [chordInput, chordOutput] = row;
                        if (typeof chordOutput !== 'undefined') {
                            chordOutput = chordOutput.replace(/Space/g, " ");
                            acc.push({ chordInput, chordOutput });
                        }
                    }
                    return acc;
                }, []);
                callback(chords);
            }
        });
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
        if (e.target.files[0]) {
            parseChordsFromCSV(e.target.files[0], (chords) => {
                if (chords.length === 0) {
                    setChordInfoMessage("The chord file is either invalid or empty.  Make sure on Dot I/O to first 'Read chords from device' and then export. ");
                } else {
                    setChordInfoMessage(`Parsed ${chords.length} chords from the file.`);
                }
            });
        }
    };


    const handleFileUpload = () => {
        if (selectedFile) {
            parseChordsFromCSV(selectedFile, (chords) => {
                if (chords.length > 0) {
                    setChordLibrary(chords);
                }
            });
        }
        setChordInfoMessage(null);
        handleCloseModal();
    };

    return (
        <div>
            <AppBar position="static">
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <KeyboardAltIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                        <Typography
                            variant="h6"
                            noWrap
                            component="a"
                            href="./"
                            sx={{
                                mr: 2,
                                display: { xs: 'none', md: 'flex' },
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            CharaChorder Utilities
                        </Typography>

                        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                            <Tooltip title="Open menu">
                                <IconButton
                                    size="large"
                                    aria-label="settings menu"
                                    aria-controls="menu-appbar"
                                    aria-haspopup="true"
                                    onClick={handleOpenNavMenu}
                                    color="inherit"
                                >
                                    <MenuIcon />
                                </IconButton>
                            </Tooltip>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorElNav}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                open={Boolean(anchorElNav)}
                                onClose={handleCloseNavMenu}
                                sx={{
                                    display: { xs: 'block', md: 'none' },
                                }}
                            >
                                {pages.map((page) => (
                                    <Button key={page} component={Link} to={`/${page.toLowerCase().replace(' ', '-')}`} sx={{ my: 2, display: 'block' }}>
                                        {page}
                                    </Button>
                                ))}
                            </Menu>
                        </Box>
                        <KeyboardAltIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
                        <Typography
                            variant="h5"
                            noWrap
                            component="a"
                            href="/"
                            sx={{
                                mr: 2,
                                display: { xs: 'flex', md: 'none' },
                                flexGrow: 1,
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            CC Utilities
                        </Typography>
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            {pages.map((page) => (
                                <Button key={page} component={Link} to={`/${page.toLowerCase().replace(' ', '-')}`} sx={{ my: 2, color: 'white', display: 'block' }}>
                                    {page}
                                </Button>
                            ))}
                        </Box>
                        <Typography
                            variant="body1"
                            sx={{ 
                                color: 'white',
                                marginRight: '16px',
                                display: {xs: 'none', md: 'flex'}
                             }}
                        >
                            Chords: {chordLibrary.length}
                        </Typography>
                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title="Open settings">
                                <SettingsIcon onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                </SettingsIcon>
                            </Tooltip>
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                {
                                    <MenuItem
                                        key="Load Chord Library"
                                        onClick={() => { handleOpenModal(); handleCloseUserMenu(); }}
                                    >
                                        <Typography textAlign="center">Load Chord Library</Typography>
                                    </MenuItem>
                                }
                            </Menu>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
            <Dialog open={openModal} onClose={handleCloseModal}>
                <DialogTitle>Upload Chord Library File</DialogTitle>
                <DialogContent>
                    <DialogContentText>Browse for your exported Chord Library from <a href="http://www.iq-eq.io/#/manager">Dot I/O</a> for use in the Chord Tools and Practice.</DialogContentText>
                    <Input type="file" accept=".csv" onChange={handleFileChange} />
                    <Typography variant="body2" color={(chordInfoMessage && chordInfoMessage.includes('invalid')) ? 'error' : 'textPrimary'}>
                        {chordInfoMessage}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="primary">Cancel</Button>
                    <Button onClick={handleFileUpload} color="primary">Submit</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
export default ButtonAppBar;