document.addEventListener('DOMContentLoaded', function() {
    // Registra il Service Worker per la PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker registrato con successo:', registration.scope);
            })
            .catch(error => {
                console.log('Registrazione ServiceWorker fallita:', error);
            });
    }

    const weightInput = document.getElementById('weight');
    const repsInput = document.getElementById('reps');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultsSection = document.getElementById('results-section');
    const resultsGrid = document.getElementById('results-grid');
    const averageVal = document.getElementById('average-val');
    const manualOneRmInput = document.getElementById('manual-one-rm');
    const repTableBody = document.getElementById('rep-table-body');
    const formulaSelect = document.getElementById('formula-select');

    // Sposta i pulsanti grafico sotto la media stimata (mobile e desktop)
    const toggleChartBtnEl = document.getElementById('toggle-chart-btn');
    const switchChartBtnEl = document.getElementById('switch-chart-btn');
    const averageCardEl = document.querySelector('.average-card');
    const chartContainerEl = document.getElementById('chart-container');
    if (toggleChartBtnEl && averageCardEl && chartContainerEl) {
        averageCardEl.insertAdjacentElement('afterend', toggleChartBtnEl);
        // Lo manteniamo nascosto finché non si calcola
        toggleChartBtnEl.style.display = 'none';
        // Larghezza piena solo su mobile
        if (window.innerWidth <= 600) {
            toggleChartBtnEl.style.width = '100%';
            toggleChartBtnEl.style.marginTop = '8px';
        }
    }

    // Assicura che "Mostra/Nascondi" venga sempre PRIMA di "Switch"
    if (switchChartBtnEl && toggleChartBtnEl && averageCardEl && chartContainerEl) {
        // Inserisci lo switch immediatamente DOPO il toggle, mantenendo l'ordine stabile
        toggleChartBtnEl.insertAdjacentElement('afterend', switchChartBtnEl);
    } else if (switchChartBtnEl && averageCardEl && chartContainerEl) {
        // Fallback: se toggle non è disponibile, inserisci dopo la card
        averageCardEl.insertAdjacentElement('afterend', switchChartBtnEl);
    }
    // Nascondi lo switch finché non si mostra il grafico
    if (switchChartBtnEl) {
        switchChartBtnEl.style.display = 'none';
        // Larghezza piena solo su mobile
        if (window.innerWidth <= 600) {
            switchChartBtnEl.style.width = '100%';
            switchChartBtnEl.style.marginTop = '8px';
        }
    }

    // Percentage tables for hevy and Proj Invictus
    const hevyPercentages = [100, 97, 94, 92, 89, 86, 83, 81, 78, 75, 73, 71, 70, 68, 67, 65, 64, 63, 61, 60];
    const projectInvictusPercentages = [100, 95, 92, 89, 86, 83, 81, 79, 77, 75, 73, 71, 70, 68, 67, 65, 64, 63, 62, 61];

    const formulas = [
        {
            name: 'hevy',
            isPrimary: true,
            calculate: (w, r) => {
                if (r < 1 || r > 20) return 0;
                const percentage = hevyPercentages[r - 1] / 100;
                return w / percentage;
            }
        },
        {
            name: 'Proj Invictus',
            isPrimary: true,
            calculate: (w, r) => {
                if (r < 1 || r > 20) return 0;
                const percentage = projectInvictusPercentages[r - 1] / 100;
                return w / percentage;
            }
        },
        {
            name: 'Adams',
            calculate: (w, r) => w / (1 - 0.02 * r)
        },
        {
            name: 'Baechle',
            calculate: (w, r) => w * (1 + 0.033 * r)
        },
        {
            name: 'Berger',
            calculate: (w, r) => w / (1.0261 * Math.exp(-0.0262 * r))
        },
        {
            name: 'Brown',
            calculate: (w, r) => w * (0.9849 + 0.0328 * r)
        },
        {
            name: 'Brzycki',
            calculate: (w, r) => w * (36 / (37 - r))
        },
        {
            name: 'Epley',
            calculate: (w, r) => w * (1 + r / 30)
        },
        {
            name: 'Kemmler',
            calculate: (w, r) => w * (0.988 + 0.0104 * r + 0.00190 * r * r - 0.0000584 * r * r * r)
        },
        {
            name: 'Kellner',
            calculate: (w, r) => w * (0.98 * Math.exp(0.0338 * r))
        },
        {
            name: 'McGlothin/Landers',
            calculate: (w, r) => w / (1.013 - 0.0267123 * r)
        },
        {
            name: 'Lombardi',
            calculate: (w, r) => w * Math.pow(r, 0.10)
        },
        {
            name: 'Mayhew',
            calculate: (w, r) => w / (0.522 + 0.419 * Math.exp(-0.055 * r))
        },
        {
            name: 'Naclerio',
            calculate: (w, r) => w / (0.951 * Math.exp(-0.021 * r))
        },
        {
            name: "O'Conner",
            calculate: (w, r) => w * (1 + 0.025 * r)
        },
        {
            name: 'Wathen',
            calculate: (w, r) => w / (0.4880 + 0.538 * Math.exp(-0.075 * r))
        }
    ];

    const inverseFormulas = [
        {
            name: 'hevy',
            isPrimary: true,
            calculateWeight: (oneRm, r) => {
                if (r < 1 || r > 20) return 0;
                const percentage = hevyPercentages[r - 1] / 100;
                return oneRm * percentage;
            }
        },
        {
            name: 'Proj Invictus',
            isPrimary: true,
            calculateWeight: (oneRm, r) => {
                if (r < 1 || r > 20) return 0;
                const percentage = projectInvictusPercentages[r - 1] / 100;
                return oneRm * percentage;
            }
        },
        {
            name: 'Adams',
            calculateWeight: (oneRm, r) => oneRm * (1 - 0.02 * r)
        },
        {
            name: 'Baechle',
            calculateWeight: (oneRm, r) => oneRm / (1 + 0.033 * r)
        },
        {
            name: 'Berger',
            calculateWeight: (oneRm, r) => oneRm * 1.0261 * Math.exp(-0.0262 * r)
        },
        {
            name: 'Brown',
            calculateWeight: (oneRm, r) => oneRm / (0.9849 + 0.0328 * r)
        },
        {
            name: 'Brzycki',
            calculateWeight: (oneRm, r) => oneRm * (37 - r) / 36
        },
        {
            name: 'Epley',
            calculateWeight: (oneRm, r) => oneRm / (1 + r / 30)
        },
        {
            name: 'Kemmler',
            calculateWeight: (oneRm, r) => oneRm / (0.988 + 0.0104 * r + 0.00190 * r * r - 0.0000584 * r * r * r)
        },
        {
            name: 'Kellner',
            calculateWeight: (oneRm, r) => oneRm / (0.98 * Math.exp(0.0338 * r))
        },
        {
            name: 'McGlothin/Landers',
            calculateWeight: (oneRm, r) => oneRm * (1.013 - 0.0267123 * r)
        },
        {
            name: 'Lombardi',
            calculateWeight: (oneRm, r) => oneRm / Math.pow(r, 0.10)
        },
        {
            name: 'Mayhew',
            calculateWeight: (oneRm, r) => oneRm * (0.522 + 0.419 * Math.exp(-0.055 * r))
        },
        {
            name: 'Naclerio',
            calculateWeight: (oneRm, r) => oneRm * 0.951 * Math.exp(-0.021 * r)
        },
        {
            name: "O'Conner",
            calculateWeight: (oneRm, r) => oneRm / (1 + 0.025 * r)
        },
        {
            name: 'Wathen',
            calculateWeight: (oneRm, r) => oneRm * (0.4880 + 0.538 * Math.exp(-0.075 * r))
        }
    ];

    let currentRoundingMode = 'exact';
    const tabBtns = document.querySelectorAll('.tab-btn');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentRoundingMode = btn.dataset.mode;
            updateRepTable();
        });
    });

    if (formulaSelect) {
        formulaSelect.addEventListener('change', () => {
            updateRepTable();
        });
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = (progress * (end - start) + start).toFixed(1);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    function showError(message) {
        let toast = document.querySelector('.error-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'error-toast';
            toast.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>${message}</span>
            `;
            document.body.appendChild(toast);
        }

        // Force reflow
        toast.offsetHeight;

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    function calculateOneRM() {
        const weight = parseFloat(weightInput.value);
        const reps = parseInt(repsInput.value);

        if (!weight || !reps || weight <= 0 || reps <= 0) {
            showError('Inserisci valori validi (peso > 0, ripetizioni > 0)');
            return;
        }

        if (reps > 20) {
            showError('Le formule sono accurate solo fino a 20 ripetizioni');
            return;
        }

        const results = formulas.map(formula => ({
            name: formula.name,
            value: formula.calculate(weight, reps),
            isPrimary: formula.isPrimary || false
        }));

        // Sort results descending by value
        results.sort((a, b) => b.value - a.value);

        const average = results.reduce((sum, r) => sum + r.value, 0) / results.length;

        if (resultsGrid) {
            resultsGrid.innerHTML = results.map(r => `
                <div class="result-card${r.isPrimary ? ' primary' : ''}" 
                     data-value="${r.value.toFixed(1)}" 
                     data-formula="${r.name}"
                     style="cursor: pointer;">
                    <div class="formula-name">${r.name}</div>
                    <div class="formula-value">${r.value.toFixed(1)} kg</div>
                </div>
            `).join('');

            // Add click listeners to cards
            document.querySelectorAll('.result-card').forEach(card => {
                card.addEventListener('click', function () {
                    const value = this.dataset.value;
                    const formulaName = this.dataset.formula;

                    // Update 1RM input
                    if (manualOneRmInput) {
                        manualOneRmInput.value = value;
                    }

                    // Update Formula Select
                    if (formulaSelect) {
                        formulaSelect.value = formulaName;
                    }

                    // Trigger update
                    updateRepTable();

                    // Visual feedback
                    document.querySelectorAll('.result-card').forEach(c => c.style.borderColor = '');
                    if (!this.classList.contains('primary')) {
                        this.style.borderColor = 'var(--accent-primary)';
                    }
                });
            });
        }

        animateValue(averageVal, 0, average, 1000);

        resultsSection.style.display = 'block';

        // Memorizza ultimi valori e media
        lastWeight = weight;
        lastReps = reps;
        latestAverageOneRm = average;

        // Update Chart (modalità corrente)
        updateChart(weight, reps);
        
        // Nascondi il grafico dopo il ricalcolo e aggiorna i pulsanti
        const chartContainerEl = document.getElementById('chart-container');
        if (chartContainerEl) {
            chartContainerEl.style.display = 'none';
        }

        // Mostra i pulsanti solo dopo aver creato il grafico
        const toggleChartBtn = document.getElementById('toggle-chart-btn');
        const switchChartBtn = document.getElementById('switch-chart-btn');
        if (toggleChartBtn) {
            toggleChartBtn.style.display = 'inline-block';
            toggleChartBtn.textContent = 'Mostra Grafico';
            toggleChartBtn.classList.remove('active');
        }
        if (switchChartBtn) {
            switchChartBtn.style.display = 'none';
            switchChartBtn.textContent = currentChartMode === 'oneRmVsReps'
                ? 'Fissato il peso -> Range Reps'
                : 'Fissate le reps -> Range Peso';
        }

        if (manualOneRmInput) {
            manualOneRmInput.value = average.toFixed(1);
            updateRepTable();
        }
    }

    function updateRepTable() {
        const oneRm = parseFloat(manualOneRmInput?.value);
        if (!oneRm || oneRm <= 0) {
            return;
        }

        const selectedFormula = formulaSelect?.value || 'average';
        let rows = '';

        for (let reps = 1; reps <= 20; reps++) {
            let estimatedWeight;

            if (selectedFormula === 'average') {
                const weights = inverseFormulas.map(f => f.calculateWeight(oneRm, reps));
                estimatedWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;
            } else {
                const formula = inverseFormulas.find(f => f.name === selectedFormula);
                estimatedWeight = formula ? formula.calculateWeight(oneRm, reps) : 0;
            }

            let displayWeight = estimatedWeight;
            let roundingIndicator = '';

            if (currentRoundingMode === 'barbell') {
                displayWeight = Math.round(estimatedWeight / 2.5) * 2.5;
            } else if (currentRoundingMode === 'dumbbell') {
                displayWeight = Math.round(estimatedWeight / 2) * 2;
            }

            // Add rounding indicator for barbell/dumbbell modes
            if (currentRoundingMode !== 'exact') {
                const diff = displayWeight - estimatedWeight;
                if (diff > 0.01) {
                    // Rounded up (disadvantageous - you need to lift more)
                    roundingIndicator = ' <span class="indicator-up">▲</span>';
                } else if (diff < -0.01) {
                    // Rounded down (advantageous - you lift less)
                    roundingIndicator = ' <span class="indicator-down">▼</span>';
                }
            }

            const percentage = ((estimatedWeight / oneRm) * 100).toFixed(0);

            rows += `
                <tr>
                    <td>${reps}</td>
                    <td><span class="weight-value">${displayWeight.toFixed(1)} kg</span>${roundingIndicator}</td>
                    <td>${percentage}%</td>
                </tr>
            `;
        }

        if (repTableBody) {
            repTableBody.innerHTML = rows;
        }
    }

    let rmChart = null;
    let currentChartMode = 'oneRmVsReps'; // 'repsVsWeight' per il secondo grafico
    let lastWeight = null;
    let lastReps = null;
    let latestAverageOneRm = null;

    function updateChart(weight, reps) {
        const ctx = document.getElementById('rm-chart').getContext('2d');
        const isRepsVsWeight = currentChartMode === 'repsVsWeight';

        // Generate labels (1 to 20 reps) di default
        let labels = Array.from({ length: 20 }, (_, i) => i + 1);

        // Generate datasets per ogni formula (modalità Peso vs Ripetizioni)
        // Calcolo l'1RM specifico della formula in base agli input correnti,
        // poi uso la formula inversa per determinare il peso necessario per ogni r (1–20).
        let datasets = formulas.map((formula, index) => {
            const oneRmForFormula = formula.calculate(weight, reps);
            const inv = inverseFormulas.find(f => f.name === formula.name);
            const data = labels.map(r => {
                if (!inv || typeof inv.calculateWeight !== 'function') return 0;
                // A r=1 mostra esattamente l'1RM della formula (coerente con i box)
                return r === 1 ? oneRmForFormula : inv.calculateWeight(oneRmForFormula, r);
            });

            // Primary formulas get special styling with different colors
            if (formula.isPrimary) {
                const isPrimaryHevy = formula.name === 'hevy';
                return {
                    label: ' ' + formula.name,
                    data: data,
                    borderColor: isPrimaryHevy ? '#f97316' : '#3b82f6', // hevy = orange, Proj Invictus = blue
                    backgroundColor: isPrimaryHevy ? 'rgba(249, 115, 22, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 8,
                    order: 0 // Draw on top
                };
            }

            // Other formulas use generated colors
            const hue = (index * 360 / formulas.length) % 360;
            const borderColor = `hsla(${hue}, 70%, 50%, 1)`;

            return {
                label: ' ' + formula.name,
                data: data,
                borderColor: borderColor,
                backgroundColor: 'transparent',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                order: 1 // Draw below primary formulas
            };
        });

        // Modalità alternativa: X = Peso (kg), Y = Ripetizioni (a 1RM medio)
        if (isRepsVsWeight) {
            // Usa un target 1RM specifico per ogni formula, calcolato dai valori inseriti
            const targetsPerFormula = formulas.map(f => f.calculate(weight, reps));

            // Definisci un range di ricerca ampio e trova le soglie dinamiche:
            // - inizio: primo peso dove almeno una formula dà reps < 20
            // - fine: primo peso dove tutte le formule danno reps = 1
            const baseMin = Math.max(0, Math.floor(weight * 0.5));
            const baseMax = Math.max(weight + 80, Math.ceil(weight * 1.8));
            const step = 1;

            // Funzione hoistata per predire le ripetizioni dato un peso
            function predictRepsForWeight(formula, w, target) {
                let bestR = 1;
                let bestDiff = Infinity;
                for (let r = 1; r <= 20; r++) {
                    const est = formula.calculate(w, r);
                    const diff = Math.abs(est - target);
                    if (diff < bestDiff) {
                        bestDiff = diff;
                        bestR = r;
                    }
                }
                return bestR;
            }

            let wLeftCandidate = null;
            let wRightCandidate = null;

            for (let w = baseMin; w <= baseMax; w += step) {
                const repsForW = formulas.map((formula, idx) => predictRepsForWeight(formula, w, targetsPerFormula[idx]));
                if (wLeftCandidate === null && repsForW.some(r => r < 20)) {
                    wLeftCandidate = w;
                }
                if (wRightCandidate === null && repsForW.every(r => r === 1)) {
                    wRightCandidate = w;
                    // Non interrompiamo subito per garantire che wLeftCandidate sia calcolato,
                    // ma se già noto, possiamo uscire.
                    if (wLeftCandidate !== null) break;
                }
            }

            const startWeight = wLeftCandidate != null
                ? Math.max(0, Math.floor(wLeftCandidate * 0.95))
                : baseMin;
            const endWeight = wRightCandidate != null
                ? Math.ceil(wRightCandidate * 1.05)
                : baseMax;

            labels = [];
            if (endWeight > startWeight) {
                for (let w = startWeight; w <= endWeight; w += step) labels.push(w);
            } else {
                // Fallback: usa il range base
                for (let w = baseMin; w <= baseMax; w += step) labels.push(w);
            }

            

            datasets = formulas.map((formula, index) => {
                const data = labels.map(w => predictRepsForWeight(formula, w, targetsPerFormula[index]));
                if (formula.isPrimary) {
                    const isPrimaryHevy = formula.name === 'hevy';
                    return {
                        label: ' ' + formula.name,
                        data: data,
                        borderColor: isPrimaryHevy ? '#f97316' : '#3b82f6',
                        backgroundColor: isPrimaryHevy ? 'rgba(249, 115, 22, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 8,
                        order: 0
                    };
                }
                const hue = (index * 360 / formulas.length) % 360;
                const borderColor = `hsla(${hue}, 70%, 50%, 1)`;
                return {
                    label: ' ' + formula.name,
                    data: data,
                    borderColor: borderColor,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    order: 1
                };
            });
        }

        // Calcola indice annotazione sul asse X
        const annotationIndex = !isRepsVsWeight
            ? Math.max(0, Math.min(labels.length - 1, reps - 1))
            : (function() {
                if (!labels.length) return 0;
                let idx = 0;
                let best = Infinity;
                for (let i = 0; i < labels.length; i++) {
                    const diff = Math.abs(labels[i] - weight);
                    if (diff < best) { best = diff; idx = i; }
                }
                return idx;
            })();

        if (rmChart) {
            rmChart.destroy();
        }

        rmChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: isRepsVsWeight
                            ? 'Fissato il peso -> Range Reps'
                            : 'Fissate le reps -> Range Peso',
                        font: {
                            size: window.innerWidth < 768 ? 14 : 16,
                            family: "'Outfit', sans-serif",
                            weight: 600
                        },
                        color: '#0f172a',
                        padding: window.innerWidth < 768 ? 16 : 20
                    },
                    legend: {
                        position: 'bottom',
                        fullSize: false,
                        padding: window.innerWidth < 768 ? 4 : 10,
                        title: {
                            display: true,
                            padding: window.innerWidth < 768 ? 10 : 20
                        },
                        labels: {
                            usePointStyle: true,
                            boxWidth: window.innerWidth < 768 ? 6 : 8,
                            font: {
                                family: "'Outfit', sans-serif",
                                size: window.innerWidth < 768 ? 10 : 11
                            }
                        }
                    },
                    tooltip: {
                        enabled: false,
                        external: function (context) {
                            const { chart, tooltip } = context;
                            let tooltipEl = chart.canvas.parentNode.querySelector('.chartjs-tooltip');

                            // Crea l'elemento tooltip se non esiste
                            if (!tooltipEl) {
                                tooltipEl = document.createElement('div');
                                tooltipEl.className = 'chartjs-tooltip';
                                tooltipEl.style.pointerEvents = 'none';
                                tooltipEl.style.position = 'absolute';
                                tooltipEl.style.transform = 'translate(-50%, 0)';
                                tooltipEl.style.transition = 'all .1s ease';
                                tooltipEl.style.background = 'rgba(255, 255, 255, 0.95)';
                                tooltipEl.style.border = '1px solid #e2e8f0';
                                tooltipEl.style.borderRadius = '8px';
                                tooltipEl.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.08)';
                                tooltipEl.style.padding = '12px';
                                tooltipEl.style.zIndex = '999';
                                tooltipEl.style.fontFamily = "'Outfit', sans-serif";
                                chart.canvas.parentNode.appendChild(tooltipEl);
                            }

                            // Nasconde il tooltip quando non visibile
                            if (!tooltip || tooltip.opacity === 0) {
                                tooltipEl.style.opacity = '0';
                                return;
                            }

                            // Prepara contenuti
                            const items = tooltip.dataPoints ? tooltip.dataPoints.slice() : [];
                            items.sort((a, b) => b.parsed.y - a.parsed.y);

                            const xLabel = items.length ? items[0].label : '';
                            const values = items.map(i => i.parsed.y);
                            const hasValues = values.length > 0;
                            const minVal = hasValues ? Math.min(...values) : null;
                            const maxVal = hasValues ? Math.max(...values) : null;
                            const roundToTenth = (val) => Math.round(val * 10) / 10;
                            const intervalText = hasValues
                                ? (isRepsVsWeight
                                    ? `[${Math.round(minVal)} Reps - ${Math.round(maxVal)} Reps]`
                                    : `[${roundToTenth(minVal).toFixed(1)} Kg - ${roundToTenth(maxVal).toFixed(1)} Kg]`)
                                : '';
                            const titleText = isRepsVsWeight
                                ? `${roundToTenth(Number(xLabel)).toFixed(1)} Kg ${intervalText}`
                                : `${xLabel} Reps ${intervalText}`;

                            // Costruzione HTML: titolo e righe dei dataset
                            let innerHtml = '';
                            innerHtml += `<div style="color:#0f172a;font-weight:600;font-size:${window.innerWidth < 768 ? 14 : 16}px;margin-bottom:8px;">${titleText}</div>`;

                            for (const item of items) {
                                const datasetLabel = item.dataset && item.dataset.label ? item.dataset.label : '';
                                const bold = /hevy|Proj Invictus/i.test(datasetLabel);
                                const labelHtml = bold ? `<strong>${datasetLabel}</strong>` : datasetLabel;
                                const valueHtml = isRepsVsWeight
                                    ? `${item.parsed.y.toFixed(0)}`
                                    : `${(Math.round(item.parsed.y * 10) / 10).toFixed(1)} Kg`;
                                innerHtml += `<div style="color:#64748b;font-weight:${bold ? 700 : 400};font-size:${window.innerWidth < 768 ? 12 : 13}px;line-height:1.4;">${labelHtml}: ${valueHtml}</div>`;
                            }

                            tooltipEl.innerHTML = innerHtml;

                            // Posizionamento vicino al cursore
                            const { offsetLeft, offsetTop } = chart.canvas;
                            tooltipEl.style.opacity = '1';
                            tooltipEl.style.left = offsetLeft + tooltip.caretX + 'px';
                            tooltipEl.style.top = offsetTop + tooltip.caretY + 12 + 'px';
                        }
                    },
                    annotation: {
                        annotations: {
                            line1: {
                                type: 'line',
                                scaleID: 'x',
                                value: annotationIndex,
                                borderColor: 'rgba(100, 116, 139, 0.5)',
                                borderWidth: 2,
                                borderDash: [5, 5],
                                label: {
                                    display: true,
                                    content: isRepsVsWeight ? `${weight.toFixed(1)} kg` : `${reps} reps`,
                                    position: 'start',
                                    backgroundColor: 'rgba(100, 116, 139, 0.8)',
                                    color: '#fff',
                                    font: {
                                        size: 11,
                                        weight: 'bold'
                                    },
                                    padding: 4
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: isRepsVsWeight ? 'Peso (kg)' : 'Ripetizioni',
                            font: {
                                family: "'Outfit', sans-serif",
                                weight: 600
                            },
                            padding: {
                                top: 15,
                                bottom: 5
                            }
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: isRepsVsWeight ? 'Ripetizioni' : 'Peso (kg)',
                            font: {
                                family: "'Outfit', sans-serif",
                                weight: 600
                            },
                            padding: {
                                top: 15,
                                bottom: 5
                            }
                        },
                        grid: {
                            color: '#f1f5f9'
                        }
                    }
                }
            }
        });
    }

    calculateBtn.addEventListener('click', calculateOneRM);

    weightInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculateOneRM();
    });

    repsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculateOneRM();
    });

    if (manualOneRmInput) {
        manualOneRmInput.addEventListener('input', updateRepTable);
    }

    // Gestore per il pulsante toggle del grafico
    const toggleChartBtn = document.getElementById('toggle-chart-btn');
    const chartContainer = document.getElementById('chart-container');
    const switchChartBtn = document.getElementById('switch-chart-btn');
    
    if (toggleChartBtn && chartContainer) {
        toggleChartBtn.addEventListener('click', function() {
            if (chartContainer.style.display === 'none') {
                // Su mobile usiamo flex per rispettare il layout
                const isMobile = window.innerWidth <= 600;
                chartContainer.style.display = isMobile ? 'flex' : 'block';
                toggleChartBtn.textContent = 'Nascondi Grafico';
                toggleChartBtn.classList.add('active');
                if (switchChartBtn) {
                    switchChartBtn.style.display = 'inline-block';
                }
            } else {
                chartContainer.style.display = 'none';
                toggleChartBtn.textContent = 'Mostra Grafico';
                toggleChartBtn.classList.remove('active');
                if (switchChartBtn) {
                    switchChartBtn.style.display = 'none';
                }
            }
        });
    }

    // Gestore del pulsante di switch modalità grafico
    if (switchChartBtn && chartContainer) {
        switchChartBtn.addEventListener('click', function() {
            currentChartMode = currentChartMode === 'oneRmVsReps' ? 'repsVsWeight' : 'oneRmVsReps';
            switchChartBtn.textContent = currentChartMode === 'oneRmVsReps'
                ? 'Fissato il peso -> Range Reps'
                : 'Fissate le reps -> Range Peso';
            if (chartContainer.style.display !== 'none' && lastWeight != null && lastReps != null) {
                updateChart(lastWeight, lastReps);
            }
        });
    }

    // Gestione resize per Chart.js su mobile
    window.addEventListener('resize', function() {
        if (rmChart) {
            setTimeout(() => {
                rmChart.resize();
                rmChart.options.plugins.title.font.size = window.innerWidth < 768 ? 14 : 16;
                rmChart.options.plugins.title.padding = window.innerWidth < 768 ? 16 : 20;
                rmChart.options.plugins.legend.labels.font.size = window.innerWidth < 768 ? 10 : 11;
                rmChart.options.plugins.legend.labels.boxWidth = window.innerWidth < 768 ? 6 : 8;
                rmChart.options.plugins.legend.title.padding = window.innerWidth < 768 ? 10 : 20;
                rmChart.update('none');
            }, 100);
        }

        // Aggiorna layout pulsanti su resize (desktop affiancati, mobile impilati)
        const tBtn = document.getElementById('toggle-chart-btn');
        const sBtn = document.getElementById('switch-chart-btn');
        const isMobile = window.innerWidth <= 600;
        if (tBtn && sBtn) {
            if (isMobile) {
                tBtn.style.width = '100%';
                sBtn.style.width = '100%';
                sBtn.style.marginTop = '8px';
            } else {
                tBtn.style.width = '';
                sBtn.style.width = '';
                sBtn.style.marginTop = '';
            }
        }
    });
});
