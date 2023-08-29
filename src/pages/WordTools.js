import { React, useState } from 'react';
import { TextField, Typography, Button, Divider } from '@mui/material';
import { Card, CardActions, CardContent, CardMedia } from '@mui/material';
import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel, Grid } from '@mui/material';
import { calculateBigrams, createFrequencyTable, findMissingChords, getPhraseFrequency } from '../functions/wordAnalysis';
import LinearWithValueLabel from '../components/LinearWithValueLabel';
import bigrams from '../assets/bigrams.png';
import anagrams from '../assets/anagrams.png';
import wordsPng from '../assets/words.png';
import phrasesPng from '../assets/phrases.png';
import AnagramWorker from 'workerize-loader!../functions/anagramWorker'; // eslint-disable-line import/no-webpack-loader-syntax

function WordTools({ chordLibrary = [], setChordLibrary }) {
    const [textToAnalyze, setTextToAnalyze] = useState('');
    const [currentAnalysis, setCurrentAnalysis] = useState(null);
    const [anagramPairs, setAnagramPairs] = useState([]);
    const [loadingAnagrams, setLoadingAnagrams] = useState(false);
    const [anagramProgress, setAnagramProgress] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [sortOrder, setSortOrder] = useState('asc');
    const [bigramCounts, setBigramCounts] = useState({});
    const [sortedBigramCounts, setSortedBigramCounts] = useState([]);
    const [frequencyMatrix, setFrequencyMatrix] = useState(Array(26).fill().map(() => Array(26).fill(0)));
    const [normalizedFrequencyMatrix, setNormalizedFrequencyMatrix] = useState(Array(26).fill().map(() => Array(26).fill(0)));
    const [sortedWords, setSortedWords] = useState([]);
    const [commonPhrases, setCommonPhrases] = useState({});
    const [uniqueWordCount, setUniqueWordCount] = useState(0);
    const [chordWordCount, setChordWordCount] = useState(0);
    const anagramWorker = new AnagramWorker();

    const handleChange = (event) => {
        setTextToAnalyze(event.target.value);
    };

    const handleSortClick = () => {
        const sortedData = [...sortedBigramCounts].sort((a, b) => (
            sortOrder === 'asc' ? a[1] - b[1] : b[1] - a[1]
        ));

        setSortedBigramCounts(sortedData);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const clickFindBigrams = () => {
        setCurrentAnalysis('bigram');
        const [counts] = calculateBigrams(textToAnalyze);
        const [matrix, normalizedMatrix] = createFrequencyTable(counts);
        setFrequencyMatrix(matrix);
        setNormalizedFrequencyMatrix(normalizedMatrix);
        setBigramCounts(counts);
        const sortedCounts = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        setSortedBigramCounts(sortedCounts);
        setShowResults(true);
    };

    const clickPartialAnagrams = () => {
        setAnagramPairs([]);
        setShowResults(false);
        setLoadingAnagrams(true);
        setCurrentAnalysis('anagram');
        anagramWorker.postMessage({ type: 'computeAnagrams', input: textToAnalyze });
    };

    anagramWorker.addEventListener('message', (event) => {
        if (event.data.type === 'progress') {
            setAnagramProgress(event.data.progress);
        }
        if (event.data.type === 'result') {
            setAnagramPairs(event.data.result);
            setShowResults(true);
            setLoadingAnagrams(false);
        }
    });

    const clickWordStatistics = () => {
        setCurrentAnalysis('words');
        (async () => {
            const [newSortedWords, newUniqueWordCount, newChordWordCount] = await findMissingChords(textToAnalyze, chordLibrary);
            setSortedWords(newSortedWords);
            setUniqueWordCount(newUniqueWordCount);
            setChordWordCount(newChordWordCount);
        })();
        setShowResults(true);
    };

    const clickPhraseStatistics = () => {
        setCurrentAnalysis('phrases');
        const phrases = getPhraseFrequency(textToAnalyze, 3, 5, chordLibrary);
        setCommonPhrases(phrases);
        setShowResults(true);
    };

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Word Tools
            </Typography>
            <TextField
                id="outlined-multiline-static"
                label="Text to analyze"
                multiline
                fullWidth
                rows={4}
                placeholder="Paste text to analyze"
                value={textToAnalyze}
                onChange={handleChange}
            />
            <Divider style={{ margin: '20px 0' }} />
            <Grid container spacing={3}>
                <Grid item>
                    <Card sx={{ maxWidth: 345 }}>
                        <CardMedia
                            sx={{ height: 175 }}
                            image={bigrams}
                            title="illustration of bigrams"
                        />
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                Bigram Statistics
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Bigrams are pairs of consecutive letters.  While
                                you can use 2 letter chords on your CharaChorder device,
                                you might want to avoid common ones that you type so
                                that you don't accidentally trigger chords while typing with
                                character entry.
                            </Typography>
                        </CardContent>
                        <CardActions style={{ justifyContent: 'center' }}>
                            <Button variant="contained" color="primary" onClick={clickFindBigrams}>Run this analysis</Button>
                        </CardActions>
                    </Card>
                </Grid>
                <Grid item>
                    <Card sx={{ maxWidth: 345 }}>
                        <CardMedia
                            sx={{ height: 175 }}
                            image={anagrams}
                            title="illustration of anagrams"
                        />
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                Partial Anagrams
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Partial anagrams are words that share the same unique
                                letters. These words should be considered closely when deciding chords,
                                since you can't just use all of the letters of the word.
                            </Typography>
                        </CardContent>
                        <CardActions style={{ justifyContent: 'center' }}>
                            <Button variant="contained" color="primary" onClick={clickPartialAnagrams}>Run this analysis</Button>
                        </CardActions>
                    </Card>
                </Grid>
                <Grid item>
                    <Card sx={{ maxWidth: 345 }}>
                        <CardMedia
                            sx={{ height: 175 }}
                            image={wordsPng}
                            title="illustration of word statistics"
                        />
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                Word Statistics
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Calculate the most frequent words in the text and identify any that
                                you don't have in your chord library.
                            </Typography>
                        </CardContent>
                        <CardActions style={{ justifyContent: 'center' }}>
                            <Button variant="contained" color="primary" onClick={clickWordStatistics}>Run this analysis</Button>
                        </CardActions>
                    </Card>
                </Grid>
                <Grid item>
                    <Card sx={{ maxWidth: 345 }}>
                        <CardMedia
                            sx={{ height: 175 }}
                            image={phrasesPng}
                            title="illustration of phrase statistics"
                        />
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                Phrase Statistics
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Calculate the most frequent phrases in the text and identify any that
                                you don't have in your chord library.
                            </Typography>
                        </CardContent>
                        <CardActions style={{ justifyContent: 'center' }}>
                            <Button variant="contained" color="primary" onClick={clickPhraseStatistics}>Run this analysis</Button>
                        </CardActions>
                    </Card>
                </Grid>
            </Grid>

            {
                showResults && (
                    <>
                        <Typography variant="h4" gutterTop>Results</Typography>
                        <Divider style={{ margin: '20px 0' }} />
                    </>
                )
            }
            {
                loadingAnagrams && (
                    <>
                        <Typography variant="h6">Analyzing the text for partial anagrams</Typography>
                        <LinearWithValueLabel value={anagramProgress} />
                    </>
                )
            }
            {
                currentAnalysis === 'anagram' && (
                    anagramPairs && anagramPairs.length > 0 ? (
                        anagramPairs
                            .map(pair => ({
                                pair,
                                count: pair.reduce((sum, wordObj) => sum + wordObj.count, 0)
                            }))
                            .sort((a, b) => b.count - a.count)
                            .map(({ pair }, index) => (
                                <Typography>
                                    {pair.map(wordObj => wordObj.word + " (" + wordObj.count + ")").join(', ')}
                                </Typography>
                            ))
                    ) : (
                        showResults && <Typography variant="body1" align="center">No partial anagrams found in the text</Typography>
                    )
                )}

            {
                currentAnalysis === 'bigram' && (
                    bigramCounts && (
                        <div>
                            <Typography variant="h6">Frequency Table</Typography>
                            {currentAnalysis === 'bigram' && (
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell></TableCell>
                                            {[...Array(26)].map((_, i) => (
                                                <TableCell key={i}>{String.fromCharCode(65 + i)}</TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {frequencyMatrix.map((row, i) => (
                                            <TableRow key={i}>
                                                <TableCell>{String.fromCharCode(65 + i)}</TableCell>
                                                {row.map((cell, j) => {
                                                    const brightness = normalizedFrequencyMatrix[i][j];
                                                    const textColor = brightness < 128 ? 'black' : 'white';
                                                    return (
                                                        <TableCell key={j} style={{ backgroundColor: `rgb(${255 - brightness}, ${255 - brightness}, ${255 - brightness})`, color: textColor }}>
                                                            {cell.toFixed(1)}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                            <Typography variant="h6">Bigram List</Typography>
                            <div style={{ maxWidth: 'fit-content', margin: 'auto' }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Bigram Pair</TableCell>
                                            <TableCell>
                                                <TableSortLabel
                                                    active={true}
                                                    direction={sortOrder}
                                                    onClick={handleSortClick}
                                                >
                                                    Count
                                                </TableSortLabel>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sortedBigramCounts.map(([bigram, count]) => (
                                            <TableRow key={bigram}>
                                                <TableCell>{bigram}</TableCell>
                                                <TableCell>{count}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                        </div>
                    )
                )
            }
            {
                currentAnalysis === 'words' && (
                    <>
                        {showResults && (
                            <>
                                <Typography variant="h6">
                                    {chordLibrary.length > 0
                                        ? `You have chords for ${Math.round((chordWordCount / uniqueWordCount) * 100)}% (${chordWordCount} / ${uniqueWordCount}) of the unique words in the text (case insensitive).`
                                        : `There are ${uniqueWordCount} unique words in the text (case insensitive).`}
                                </Typography>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Word</TableCell>
                                                <TableCell align="right">Frequency</TableCell>
                                                <TableCell align="right">Score (Length * Frequency)</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {sortedWords.map((word) => (
                                                <TableRow key={word[0]}>
                                                    <TableCell component="th" scope="row">
                                                        {word[0]}
                                                    </TableCell>
                                                    <TableCell align="right">{word[1]}</TableCell>
                                                    <TableCell align="right">{word[0].length * Number(word[1])}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </>
                )
            }
            {
                currentAnalysis === 'phrases' && (
                    <>
                        {commonPhrases.length > 0 ? (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Phrase</TableCell>
                                            <TableCell align="right">Frequency</TableCell>
                                            <TableCell align="right">Score (Length * Frequency)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {commonPhrases.map((phraseEntry) => (
                                            <TableRow key={phraseEntry[0]}>
                                                <TableCell component="th" scope="row">
                                                    {phraseEntry[0]}
                                                </TableCell>
                                                <TableCell align="right">{phraseEntry[1]}</TableCell>
                                                <TableCell align="right">{phraseEntry[0].split(' ').join('').length * Number(phraseEntry[1])}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Typography variant="body1" align="center">
                                No phrases have been found.
                            </Typography>
                        )}
                    </>
                )
            }
        </div>
    );
}

export default WordTools;