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
            start: time,
            style: `color: white`,
            className: color
        };
    }));
    const options = {
        orientation: 'top', 
        align: `left`,
        order: (a,b) => b.time - a.time
    };
    const timeline = new vis.Timeline(container, items, options);
});
resetButton.addEventListener('click', () => {
    const container = document.getElementById('visualization');
    container.replaceChildren();
    events = [];
    input.value = '';
});
