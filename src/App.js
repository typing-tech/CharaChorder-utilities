import * as React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import ButtonAppBar from './components/ButtonAppBar';
import ChordTools from './pages/ChordTools';
import WordTools from './pages/WordTools';
import Practice from './pages/Practice';
import HomePage from './pages/HomePage';

export default function App() {
  const [chordLibrary, setChordLibrary] = React.useState(
    JSON.parse(localStorage.getItem("chordLibrary")) || []
  );

  React.useEffect(() => {
    localStorage.setItem("chordLibrary", JSON.stringify(chordLibrary));
  }, [chordLibrary]);

  return (
    <Container maxWidth="xl">
      <Router basename="/">
        <ButtonAppBar chordLibrary={chordLibrary} setChordLibrary={setChordLibrary} />
        <Box sx={{ my: 4 }}>
          <Routes>
            <Route path="/" element={<HomePage></HomePage>} />
            <Route path="/word-tools" element={<WordTools chordLibrary={chordLibrary} setChordLibrary={setChordLibrary} />} />
            <Route path="/chord-tools" element={<ChordTools chordLibrary={chordLibrary} setChordLibrary={setChordLibrary} />} />
            <Route path="/practice" element={<Practice chordLibrary={chordLibrary} setChordLibrary={setChordLibrary} />} />
          </Routes>
        </Box>
      </Router>
    </Container>
  );
}