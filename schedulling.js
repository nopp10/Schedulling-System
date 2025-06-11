function generateInputFields() {
    const numProcesses = document.getElementById('numProcesses').value;
    const processInputs = document.getElementById('processInputs');
    processInputs.innerHTML = '';

    for (let i = 0; i < numProcesses; i++) {
        processInputs.innerHTML += `
            <h3>Process ${i + 1}</h3>
            <label for="arrivalTime${i}">Arrival Time:</label>
            <input type="number" id="arrivalTime${i}" required>
            <label for="burstTime${i}">Burst Time:</label>
            <input type="number" id="burstTime${i}" required>
            <br><br>
        `;

        processInputs.innerHTML += `
        <h3>Round Robin Quantum</h3>
        <label for="quantum">Quantum:</label>
        <input type="number" id="quantum" required>
        <br><br>
    `   ;

    }
    
}

function calculateScheduling() {
    const numProcesses = document.getElementById('numProcesses').value;
    const quantum = parseInt(document.getElementById('quantum').value);
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    const processes = [];

    for (let i = 0; i < numProcesses; i++) {
        const arrivalTime = parseInt(document.getElementById(`arrivalTime${i}`).value);
        const burstTime = parseInt(document.getElementById(`burstTime${i}`).value);
        processes.push({ name: String.fromCharCode(65 + i), arrivalTime, burstTime });
    }

    const fifoResults = fifoScheduling(JSON.parse(JSON.stringify(processes)));
    const sjfResults = sjfScheduling(JSON.parse(JSON.stringify(processes)));
    const rrResults = roundRobinScheduling(JSON.parse(JSON.stringify(processes)), quantum);
    const srtfResults = srtfScheduling(JSON.parse(JSON.stringify(processes)));

    displayResults(fifoResults, "FIFO Scheduling");
    displayResults(sjfResults, "SJF Scheduling");
    displayResults(rrResults, `Round Robin Scheduling (Quantum = ${quantum})`);
    displayResults(srtfResults, "SRTF Scheduling");
}



function displayResults(results, title) {
    const resultsDiv = document.getElementById('results');
    let html = `<h3>${title}</h3>`;
    html += `
        <table>
            <tr>
                <th>Process</th>
                <th>Arrival Time</th>
                <th>Burst Time</th>
                <th>Completion Time</th>
                <th>Turnaround Time</th>
            </tr>
    `;
    results.forEach(p => {
        html += `
            <tr>
                <td>${p.name}</td>
                <td>${p.arrivalTime}</td>
                <td>${p.burstTime}</td>
                <td>${p.completionTime !== undefined ? p.completionTime : ''}</td>
                <td>${p.turnaroundTime !== undefined ? p.turnaroundTime : ''}</td>
            </tr>
        `;
    });
    html += `</table>`;
    resultsDiv.innerHTML += html;
}

function fifoScheduling(processes) {
    let currentTime = 0;
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    processes.forEach(p => {
        if (currentTime < p.arrivalTime) {
            currentTime = p.arrivalTime;
        }
        currentTime += p.burstTime;
        p.completionTime = currentTime;
        p.turnaroundTime = p.completionTime - p.arrivalTime;
    });
    return processes;
}

function sjfScheduling(processes) {
    let currentTime = 0;
    let completedCount = 0;
    const completed = new Array(processes.length).fill(false);

    while (completedCount < processes.length) {
        let idx = -1;
        let minBurst = Infinity;

        processes.forEach((p, i) => {
            if (!completed[i] && p.arrivalTime <= currentTime && p.burstTime < minBurst) {
                idx = i;
                minBurst = p.burstTime;
            }
        });

        if (idx !== -1) {
            const p = processes[idx];
            currentTime += p.burstTime;
            p.completionTime = currentTime;
            p.turnaroundTime = p.completionTime - p.arrivalTime;
            completed[idx] = true;
            completedCount++;
        } else {
            currentTime++;
        }
    }
    return processes;
}

function roundRobinScheduling(processes, quantum) {
    let currentTime = 0;
    const remaining = processes.map(p => p.burstTime);
    const completed = new Array(processes.length).fill(false);
    let completedCount = 0;
    const queue = [];


    while (completedCount < processes.length) {
        processes.forEach((p, i) => {
            if (p.arrivalTime <= currentTime && !completed[i] && !queue.includes(i)) {
                queue.push(i);
            }
        });

        if (queue.length === 0) {
            currentTime++;
            continue;
        }

        const idx = queue.shift();
        const p = processes[idx];
        const execTime = Math.min(quantum, remaining[idx]);
        remaining[idx] -= execTime;
        currentTime += execTime;

        if (remaining[idx] === 0) {
            p.completionTime = currentTime;
            p.turnaroundTime = p.completionTime - p.arrivalTime;
            completed[idx] = true;
            completedCount++;
        } else {
            queue.push(idx);
        }
    }
    return processes;
}

function srtfScheduling(processes) {
    let currentTime = 0;
    let completedCount = 0;
    const completed = new Array(processes.length).fill(false);

    while (completedCount < processes.length) {
        let idx = -1;
        let minBurst = Infinity;

        processes.forEach((p, i) => {
            if (!completed[i] && p.arrivalTime <= currentTime && p.burstTime < minBurst) {
                idx = i;
                minBurst = p.burstTime;
            }
        });

        if (idx !== -1) {
            const p = processes[idx];
            currentTime += p.burstTime;
            p.completionTime = currentTime;
            p.turnaroundTime = p.completionTime - p.arrivalTime;
            completed[idx] = true;
            completedCount++;
        } else {
            currentTime++;
        }
    }
    return processes;
}