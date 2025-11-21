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

    // Percentage tables for hevy and Project Invictus
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
            name: 'Project Invictus',
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
            name: 'Project Invictus',
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

        // Update Chart
        updateChart(weight, reps);
        
        // Il grafico rimane nascosto - l'utente deve cliccare "Mostra Grafico" per vederlo

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

    function updateChart(weight, reps) {
        const ctx = document.getElementById('rm-chart').getContext('2d');

        // Generate labels (1 to 20 reps)
        const labels = Array.from({ length: 20 }, (_, i) => i + 1);

        // Generate datasets for each formula
        const datasets = formulas.map((formula, index) => {
            const data = labels.map(r => formula.calculate(weight, r));

            // Primary formulas get special styling with different colors
            if (formula.isPrimary) {
                const isPrimaryHevy = formula.name === 'hevy';
                return {
                    label: ' ' + formula.name,
                    data: data,
                    borderColor: isPrimaryHevy ? '#f97316' : '#3b82f6', // hevy = orange, Project Invictus = blue
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
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Confronto Formule: 1RM Stimato vs Ripetizioni (a parità di peso)',
                        font: {
                            size: window.innerWidth < 768 ? 14 : 16,
                            family: "'Outfit', sans-serif",
                            weight: 600
                        },
                        color: '#0f172a',
                        padding: window.innerWidth < 768 ? 10 : 20
                    },
                    legend: {
                        position: 'bottom',
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
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#0f172a',
                        bodyColor: '#64748b',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        padding: 12,
                        boxPadding: 4,
                        usePointStyle: true,
                        itemSort: function (a, b) {
                            // Sort descending (highest value first)
                            return b.parsed.y - a.parsed.y;
                        },
                        callbacks: {
                            label: function (context) {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} kg`;
                            }
                        }
                    },
                    annotation: {
                        annotations: {
                            line1: {
                                type: 'line',
                                scaleID: 'x',
                                value: reps - 1,
                                borderColor: 'rgba(100, 116, 139, 0.5)',
                                borderWidth: 2,
                                borderDash: [5, 5],
                                label: {
                                    display: true,
                                    content: `${reps} reps`,
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
                            text: 'Ripetizioni',
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
                            text: '1RM Stimato (kg)',
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
    
    if (toggleChartBtn && chartContainer) {
        toggleChartBtn.addEventListener('click', function() {
            if (chartContainer.style.display === 'none') {
                chartContainer.style.display = 'block';
                toggleChartBtn.textContent = 'Nascondi Grafico';
                toggleChartBtn.classList.add('active');
            } else {
                chartContainer.style.display = 'none';
                toggleChartBtn.textContent = 'Mostra Grafico';
                toggleChartBtn.classList.remove('active');
            }
        });
    }

    // Gestione resize per Chart.js su mobile
    window.addEventListener('resize', function() {
        if (rmChart) {
            setTimeout(() => {
                rmChart.resize();
                rmChart.options.plugins.title.font.size = window.innerWidth < 768 ? 14 : 16;
                rmChart.options.plugins.title.padding = window.innerWidth < 768 ? 10 : 20;
                rmChart.options.plugins.legend.labels.font.size = window.innerWidth < 768 ? 10 : 11;
                rmChart.options.plugins.legend.labels.boxWidth = window.innerWidth < 768 ? 6 : 8;
                rmChart.options.plugins.legend.title.padding = window.innerWidth < 768 ? 10 : 20;
                rmChart.update('none');
            }, 100);
        }
    });
});
