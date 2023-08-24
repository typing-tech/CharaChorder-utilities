const input = document.querySelector('input');
let events = [];
input.addEventListener('keyup', (event) => {
    events.push({ event, time: performance.now() });
});
input.addEventListener('keydown', (event) => {
    events.push({ event, time: performance.now() });
});

const plotButton = document.querySelector('#plot');
const resetButton = document.querySelector('#reset');

plotButton.addEventListener('click', () => {
    const container = document.getElementById('visualization');
    container.replaceChildren();
    const items = new vis.DataSet(events.map(({ event, time }) => {
        const color = event.type === 'keyup' ? 'red' : 'green';
        return {
            content: event.code,
            start: time - events[0].time,
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
    const timeline = new vis.Timeline(container, items, options);

    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';

    let startTime = null; 
    events.forEach(({ event, time }) => {
        if (startTime === null) {
            startTime = time;
        }
        const relativeTime = time - startTime;

        const row = tableBody.insertRow();
        const eventCell = row.insertCell(0);
        const codeCell = row.insertCell(1);
        const timeCell = row.insertCell(2);

        const eventType = event.type === 'keydown' ? 'press' : 'release'; // Replace "keydown" with "press" and "keyup" with "release"

        eventCell.innerHTML = eventType;
        codeCell.innerHTML = event.code;
        timeCell.innerHTML = relativeTime.toFixed(2) + ' ms';
    });

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

    document.getElementById('press-message').innerText =
        'The time between the first and last press was ' + pressDifference + '.';
    document.getElementById('release-message').innerText =
        'The time between the first and last release was ' + releaseDifference + '.';

});
resetButton.addEventListener('click', () => {
    const container = document.getElementById('visualization');
    container.replaceChildren();
    events = [];
    input.value = '';
});
