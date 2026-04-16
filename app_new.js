// ========== FRENCH REAL ESTATE CALCULATOR ==========
// Including: Frais d'acquisition, Capital gains tax, Inheritance tax, Maintenance costs

// CONSTANTS
const LIFE_START = 25;
const LIFE_END = 85;
const ACQUISITION_FEES_RATE = 0.075; // 7.5% frais de notaire
const MAINTENANCE_ANNUAL = 2500;
const PROPERTY_TAX_ANNUAL = 800;
const HOME_INSURANCE_ANNUAL = 300;
const MORTGAGE_YEARS = 25;
const PROPERTY_APPRECIATION = 0.02; // 2% annual

// FORMAT CURRENCY
function formatCurrency(value) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

// CALCULATE FRENCH PROPERTY TAX (ITP)
function getPropertyTax(homePrice) {
    // ITP varies by region: simple model, ~€800/year average
    return PROPERTY_TAX_ANNUAL;
}

// MAIN CALCULATION FUNCTION
function calculateScenarios(price, downPaymentPct, monthlyRent, rentInflation, buyAge, mortgageRate, inheritAge, inheritTax, capitalGainsTax) {
    const ages = Array.from({length: LIFE_END - LIFE_START + 1}, (_, i) => LIFE_START + i);
    
    const result = {
        ages: ages.tolist ? ages : Array.from(ages),
        rent: {total_cost: [], equity: [], net_cost: []},
        buy: {total_cost: [], equity: [], net_cost: [], breakdown: {}},
        inherit: {total_cost: [], equity: [], net_cost: [], breakdown: {}}
    };
    
    // ========== RENT SCENARIO ==========
    let cumRent = 0;
    for (let i = 0; i < ages.length; i++) {
        const annualRent = monthlyRent * 12 * Math.pow(1 + rentInflation / 100, i);
        cumRent += annualRent;
        result.rent.total_cost.push(Math.round(cumRent));
        result.rent.equity.push(0);
        result.rent.net_cost.push(Math.round(cumRent));
    }
    
    // ========== BUY SCENARIO ==========
    const downPayment = price * downPaymentPct / 100;
    const acquisitionFees = price * ACQUISITION_FEES_RATE;
    const mortgagePrincipal = price - downPayment;
    const monthlyRate = mortgageRate / 100 / 12;
    const nPayments = MORTGAGE_YEARS * 12;
    const monthlyPayment = mortgagePrincipal * (monthlyRate * Math.pow(1 + monthlyRate, nPayments)) / (Math.pow(1 + monthlyRate, nPayments) - 1);
    
    let cumBuy = 0;
    let homeEquity = 0;
    let totalRentBeforeBuy = 0;
    let totalMortgagePaid = 0;
    let totalMaintenanceAndTax = 0;
    
    for (let i = 0; i < ages.length; i++) {
        const age = ages[i];
        
        if (age < buyAge) {
            // RENT PHASE BEFORE BUY
            const annualRent = monthlyRent * 12 * Math.pow(1 + rentInflation / 100, i);
            cumBuy += annualRent;
            totalRentBeforeBuy += annualRent;
        } else if (age === buyAge) {
            // BUY YEAR: down payment + acquisition fees + first year mortgage
            cumBuy += downPayment + acquisitionFees;
            homeEquity = downPayment;
            
            // Add first year costs
            if (age < buyAge + MORTGAGE_YEARS) {
                cumBuy += monthlyPayment * 12 + MAINTENANCE_ANNUAL + HOME_INSURANCE_ANNUAL + getPropertyTax(price);
                totalMortgagePaid += monthlyPayment * 12;
                totalMaintenanceAndTax += MAINTENANCE_ANNUAL + HOME_INSURANCE_ANNUAL + getPropertyTax(price);
                // Principal paid in first year (roughly 30% in early years)
                homeEquity += monthlyPayment * 12 * 0.3;
            }
        } else {
            // POST-PURCHASE YEARS
            if (age < buyAge + MORTGAGE_YEARS) {
                // Still paying mortgage
                cumBuy += monthlyPayment * 12 + MAINTENANCE_ANNUAL + HOME_INSURANCE_ANNUAL + getPropertyTax(price);
                totalMortgagePaid += monthlyPayment * 12;
                totalMaintenanceAndTax += MAINTENANCE_ANNUAL + HOME_INSURANCE_ANNUAL + getPropertyTax(price);
                // Principal builds equity
                const yearsInMortgage = age - buyAge;
                const principalPaid = monthlyPayment * 12 * 0.3 * (yearsInMortgage + 1);
                homeEquity = downPayment + principalPaid;
            } else {
                // Mortgage paid off - only maintenance and tax
                cumBuy += MAINTENANCE_ANNUAL + HOME_INSURANCE_ANNUAL + getPropertyTax(price);
                totalMaintenanceAndTax += MAINTENANCE_ANNUAL + HOME_INSURANCE_ANNUAL + getPropertyTax(price);
                homeEquity = price; // Full equity after mortgage
            }
        }
        
        // Capital gains tax when selling (if equity appreciated)
        let capitalGainsTaxAmount = 0;
        if (age === LIFE_END && homeEquity > price) {
            const gain = homeEquity - price;
            capitalGainsTaxAmount = gain * capitalGainsTax / 100;
        }
        
        result.buy.total_cost.push(Math.round(cumBuy));
        result.buy.equity.push(Math.round(homeEquity));
        result.buy.net_cost.push(Math.round(Math.max(0, cumBuy + capitalGainsTaxAmount - homeEquity)));
    }
    
    result.buy.breakdown = {
        rentBeforeBuy: totalRentBeforeBuy,
        downPayment: downPayment,
        acquisitionFees: acquisitionFees,
        mortgagePaid: totalMortgagePaid,
        maintenanceAndTax: totalMaintenanceAndTax
    };
    
    // ========== INHERIT SCENARIO ==========
    let cumInherit = 0;
    let inheritanceTaxPaid = 0;
    let totalRentBeforeInherit = 0;
    let totalInheritMaint = 0;
    
    for (let i = 0; i < ages.length; i++) {
        const age = ages[i];
        
        if (age < inheritAge) {
            // RENT PHASE BEFORE INHERITANCE
            const annualRent = monthlyRent * 12 * Math.pow(1 + rentInflation / 100, i);
            cumInherit += annualRent;
            totalRentBeforeInherit += annualRent;
        } else if (age === inheritAge) {
            // INHERITANCE YEAR: pay inheritance tax
            const inheritanceTax = price * inheritTax / 100;
            cumInherit += inheritanceTax;
            inheritanceTaxPaid = inheritanceTax;
            
            // Add maintenance and tax for inherited property
            cumInherit += MAINTENANCE_ANNUAL + HOME_INSURANCE_ANNUAL + getPropertyTax(price);
            totalInheritMaint += MAINTENANCE_ANNUAL + HOME_INSURANCE_ANNUAL + getPropertyTax(price);
        } else {
            // POST-INHERITANCE: only maintenance and property tax
            cumInherit += MAINTENANCE_ANNUAL + HOME_INSURANCE_ANNUAL + getPropertyTax(price);
            totalInheritMaint += MAINTENANCE_ANNUAL + HOME_INSURANCE_ANNUAL + getPropertyTax(price);
        }
        
        const equity = age >= inheritAge ? price : 0;
        result.inherit.total_cost.push(Math.round(cumInherit));
        result.inherit.equity.push(Math.round(equity));
        result.inherit.net_cost.push(Math.round(Math.max(0, cumInherit - equity)));
    }
    
    result.inherit.breakdown = {
        rentBeforeInherit: totalRentBeforeInherit,
        inheritanceTax: inheritanceTaxPaid,
        maintenanceAndTax: totalInheritMaint
    };
    
    return result;
}

// UPDATE DISPLAYS
function updateAllDisplays(data) {
    // METRICS CARDS
    const rentFinal = data.rent.total_cost[data.rent.total_cost.length - 1];
    const buyFinal = data.buy.total_cost[data.buy.total_cost.length - 1];
    const buyEquity = data.buy.equity[data.buy.equity.length - 1];
    const inheritFinal = data.inherit.total_cost[data.inherit.total_cost.length - 1];
    const inheritEquity = data.inherit.equity[data.inherit.equity.length - 1];
    
    document.getElementById('rentTotalSpent').textContent = formatCurrency(rentFinal);
    document.getElementById('buyTotalSpent').textContent = formatCurrency(buyFinal);
    document.getElementById('buyEquity').textContent = formatCurrency(buyEquity);
    document.getElementById('inheritTotalSpent').textContent = formatCurrency(inheritFinal);
    document.getElementById('inheritEquity').textContent = formatCurrency(inheritEquity);
    
    // DETAILED TAB
    document.getElementById('detail-rent-total').textContent = formatCurrency(rentFinal);
    document.getElementById('detail-rent-net').textContent = formatCurrency(rentFinal);
    
    const buyBreakdown = data.buy.breakdown;
    document.getElementById('detail-buy-rent').textContent = formatCurrency(buyBreakdown.rentBeforeBuy);
    document.getElementById('detail-buy-down').textContent = formatCurrency(buyBreakdown.downPayment);
    document.getElementById('detail-buy-fees').textContent = formatCurrency(buyBreakdown.acquisitionFees);
    document.getElementById('detail-buy-mortgage').textContent = formatCurrency(buyBreakdown.mortgagePaid);
    document.getElementById('detail-buy-maint').textContent = formatCurrency(buyBreakdown.maintenanceAndTax);
    document.getElementById('detail-buy-total').textContent = formatCurrency(buyFinal);
    document.getElementById('detail-buy-equity').textContent = formatCurrency(buyEquity);
    document.getElementById('detail-buy-gainsTax').textContent = '—'; // Depends on appreciation
    document.getElementById('detail-buy-net').textContent = formatCurrency(data.buy.net_cost[data.buy.net_cost.length - 1]);
    
    const inheritBreakdown = data.inherit.breakdown;
    document.getElementById('detail-inherit-rent').textContent = formatCurrency(inheritBreakdown.rentBeforeInherit);
    document.getElementById('detail-inherit-tax').textContent = formatCurrency(inheritBreakdown.inheritanceTax);
    document.getElementById('detail-inherit-maint').textContent = formatCurrency(inheritBreakdown.maintenanceAndTax);
    document.getElementById('detail-inherit-total').textContent = formatCurrency(inheritFinal);
    document.getElementById('detail-inherit-equity').textContent = formatCurrency(inheritEquity);
    document.getElementById('detail-inherit-net').textContent = formatCurrency(data.inherit.net_cost[data.inherit.net_cost.length - 1]);
    
    // COMPARISON TAB
    document.getElementById('comp-rent-spent').textContent = formatCurrency(rentFinal);
    document.getElementById('comp-rent-net').textContent = formatCurrency(rentFinal);
    
    document.getElementById('comp-buy-spent').textContent = formatCurrency(buyFinal);
    document.getElementById('comp-buy-equity').textContent = formatCurrency(buyEquity);
    document.getElementById('comp-buy-net').textContent = formatCurrency(data.buy.net_cost[data.buy.net_cost.length - 1]);
    
    document.getElementById('comp-inherit-spent').textContent = formatCurrency(inheritFinal);
    document.getElementById('comp-inherit-equity').textContent = formatCurrency(inheritEquity);
    document.getElementById('comp-inherit-net').textContent = formatCurrency(data.inherit.net_cost[data.inherit.net_cost.length - 1]);
    
    // INSIGHTS
    generateInsights(data, rentFinal, buyFinal, inheritFinal);
}

// GENERATE INSIGHTS
function generateInsights(data, rentFinal, buyFinal, inheritFinal) {
    const insights = [];
    
    const buyNetCost = data.buy.net_cost[data.buy.net_cost.length - 1];
    const rentNetCost = data.rent.net_cost[data.rent.net_cost.length - 1];
    const inheritNetCost = data.inherit.net_cost[data.inherit.net_cost.length - 1];
    
    if (buyNetCost < rentNetCost) {
        const savings = rentNetCost - buyNetCost;
        insights.push(`💰 Buying saves €${Math.round(savings/1000)}k vs renting (net cost)`);
    } else {
        const extra = buyNetCost - rentNetCost;
        insights.push(`📈 Renting is €${Math.round(extra/1000)}k cheaper than buying (net cost)`);
    }
    
    const buyEquity = data.buy.equity[data.buy.equity.length - 1];
    if (buyEquity > 0) {
        insights.push(`🏠 Home equity value: ${formatCurrency(buyEquity)} (wealth built)`);
    }
    
    const inheritNetCost2 = data.inherit.net_cost[data.inherit.net_cost.length - 1];
    if (inheritNetCost2 < rentNetCost) {
        insights.push(`🎁 Inheritance best scenario (taxes considered)`);
    }
    
    const mostExpensive = Math.max(rentFinal, buyFinal, inheritFinal);
    if (rentFinal === mostExpensive) {
        insights.push(`⚠️ Rent costs most over lifetime (€${Math.round(rentFinal/1000)}k)`);
    }
    
    insights.push(`📊 Analysis: France real estate | 25-85 years | Including all taxes & fees`);
    
    const listHtml = insights.map(insight => `<div class="insight-item">${insight}</div>`).join('');
    document.getElementById('insights-list').innerHTML = listHtml;
}

// RENDER ECHO CHARTS
function renderCharts(data) {
    renderCostsChart(data);
    renderNetCostChart(data);
    renderMiniCharts(data);
}

function renderCostsChart(data) {
    const chart = echarts.init(document.getElementById('chart-costs'), null, {renderer: 'canvas'});
    
    const option = {
        color: ['#3B82F6', '#10B981', '#F59E0B'],
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(15, 15, 30, 0.9)',
            borderColor: '#667eea',
            textStyle: {color: '#e4e4e7', fontSize: 12},
            formatter: function(params) {
                if (!params.length) return '';
                let html = '<b>Age ' + params[0].axisValue + '</b><br/>';
                params.forEach(p => {
                    html += '<span style="color:' + p.color + '">●</span> ' + p.seriesName + ': <b>' + formatCurrency(p.value) + '</b><br/>';
                });
                return html;
            }
        },
        grid: {left: 70, right: 30, top: 20, bottom: 40, containLabel: false},
        xAxis: {
            type: 'category',
            data: data.ages,
            boundaryGap: false,
            axisLine: {lineStyle: {color: 'rgba(102, 126, 234, 0.2)'}},
            axisTick: {show: false},
            splitLine: {show: false},
            axisLabel: {fontSize: 11, color: '#a1a1aa'}
        },
        yAxis: {
            type: 'value',
            axisLine: {lineStyle: {color: 'rgba(102, 126, 234, 0.2)'}},
            axisTick: {show: false},
            splitLine: {lineStyle: {color: 'rgba(102, 126, 234, 0.08)', type: 'dashed'}},
            axisLabel: {fontSize: 11, color: '#a1a1aa', formatter: v => v >= 1000000 ? (v/1000000).toFixed(1)+'M' : (v/1000).toFixed(0)+'k'}
        },
        series: [
            {
                name: '🏘️ Rent',
                data: data.rent.total_cost,
                type: 'line',
                smooth: true,
                lineStyle: {width: 3},
                symbolSize: 0,
                areaStyle: {color: 'rgba(59, 130, 246, 0.1)'}
            },
            {
                name: '🏠 Buy',
                data: data.buy.total_cost,
                type: 'line',
                smooth: true,
                lineStyle: {width: 3},
                symbolSize: 0,
                areaStyle: {color: 'rgba(16, 185, 129, 0.1)'}
            },
            {
                name: '🎁 Inherit',
                data: data.inherit.total_cost,
                type: 'line',
                smooth: true,
                lineStyle: {width: 3},
                symbolSize: 0,
                areaStyle: {color: 'rgba(245, 158, 11, 0.1)'}
            }
        ]
    };
    
    chart.setOption(option, true);
}

function renderNetCostChart(data) {
    const chart = echarts.init(document.getElementById('chart-netcost'), null, {renderer: 'canvas'});
    
    const option = {
        color: ['#3B82F6', '#ef4444', '#8b5cf6'],
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(15, 15, 30, 0.9)',
            borderColor: '#667eea',
            textStyle: {color: '#e4e4e7', fontSize: 12},
            formatter: function(params) {
                if (!params.length) return '';
                let html = '<b>Age ' + params[0].axisValue + '</b><br/>';
                params.forEach(p => {
                    html += '<span style="color:' + p.color + '">●</span> ' + p.seriesName + ': <b>' + formatCurrency(p.value) + '</b><br/>';
                });
                return html;
            }
        },
        grid: {left: 70, right: 30, top: 20, bottom: 40, containLabel: false},
        xAxis: {
            type: 'category',
            data: data.ages,
            boundaryGap: false,
            axisLine: {lineStyle: {color: 'rgba(102, 126, 234, 0.2)'}},
            axisTick: {show: false},
            splitLine: {show: false},
            axisLabel: {fontSize: 11, color: '#a1a1aa'}
        },
        yAxis: {
            type: 'value',
            axisLine: {lineStyle: {color: 'rgba(102, 126, 234, 0.2)'}},
            axisTick: {show: false},
            splitLine: {lineStyle: {color: 'rgba(102, 126, 234, 0.08)', type: 'dashed'}},
            axisLabel: {fontSize: 11, color: '#a1a1aa', formatter: v => v >= 1000000 ? (v/1000000).toFixed(1)+'M' : (v/1000).toFixed(0)+'k'}
        },
        series: [
            {
                name: '🏘️ Rent',
                data: data.rent.net_cost,
                type: 'line',
                smooth: true,
                lineStyle: {width: 3},
                symbolSize: 0,
                areaStyle: {color: 'rgba(59, 130, 246, 0.1)'}
            },
            {
                name: '🏠 Buy (w/ taxes)',
                data: data.buy.net_cost,
                type: 'line',
                smooth: true,
                lineStyle: {width: 3},
                symbolSize: 0,
                areaStyle: {color: 'rgba(239, 68, 68, 0.1)'}
            },
            {
                name: '🎁 Inherit (w/ taxes)',
                data: data.inherit.net_cost,
                type: 'line',
                smooth: true,
                lineStyle: {width: 3},
                symbolSize: 0,
                areaStyle: {color: 'rgba(139, 92, 246, 0.1)'}
            }
        ]
    };
    
    chart.setOption(option, true);
}

function renderMiniCharts(data) {
    // Mini rent chart
    const chart1 = echarts.init(document.getElementById('mini-chart-rent'), null, {renderer: 'canvas'});
    chart1.setOption({
        backgroundColor: 'transparent',
        grid: {left: 0, right: 0, top: 0, bottom: 0},
        xAxis: {type: 'category', show: false},
        yAxis: {show: false},
        series: [{data: data.rent.total_cost, type: 'line', smooth: true, lineStyle: {color: '#3B82F6', width: 2}, symbolSize: 0, areaStyle: {color: 'rgba(59, 130, 246, 0.2)'}}]
    }, true);
    
    // Mini buy chart
    const chart2 = echarts.init(document.getElementById('mini-chart-buy'), null, {renderer: 'canvas'});
    chart2.setOption({
        backgroundColor: 'transparent',
        grid: {left: 0, right: 0, top: 0, bottom: 0},
        xAxis: {type: 'category', show: false},
        yAxis: {show: false},
        series: [{data: data.buy.total_cost, type: 'line', smooth: true, lineStyle: {color: '#10B981', width: 2}, symbolSize: 0, areaStyle: {color: 'rgba(16, 185, 129, 0.2)'}}]
    }, true);
    
    // Mini inherit chart
    const chart3 = echarts.init(document.getElementById('mini-chart-inherit'), null, {renderer: 'canvas'});
    chart3.setOption({
        backgroundColor: 'transparent',
        grid: {left: 0, right: 0, top: 0, bottom: 0},
        xAxis: {type: 'category', show: false},
        yAxis: {show: false},
        series: [{data: data.inherit.total_cost, type: 'line', smooth: true, lineStyle: {color: '#F59E0B', width: 2}, symbolSize: 0, areaStyle: {color: 'rgba(245, 158, 11, 0.2)'}}]
    }, true);
}

// UPDATE FUNCTION
function update() {
    const price = parseFloat(document.getElementById('priceSlider').value);
    const downPaymentPct = parseFloat(document.getElementById('downPaymentSlider').value);
    const rent = parseFloat(document.getElementById('rentSlider').value);
    const inflation = parseFloat(document.getElementById('inflationSlider').value);
    const buyAge = parseInt(document.getElementById('buyAgeSlider').value);
    const rate = parseFloat(document.getElementById('rateSlider').value);
    const inheritAge = parseInt(document.getElementById('inheritAgeSlider').value);
    const inheritTax = parseFloat(document.getElementById('inheritTaxSlider').value);
    const capitalGainsTax = parseFloat(document.getElementById('capitalGainsTaxSlider').value);
    
    // Update display values
    document.getElementById('priceValue').textContent = formatCurrency(price);
    document.getElementById('downPaymentValue').textContent = downPaymentPct + '%';
    document.getElementById('rentValue').textContent = formatCurrency(rent) + '/month';
    document.getElementById('inflationValue').textContent = inflation.toFixed(1) + '%';
    document.getElementById('buyAgeValue').textContent = buyAge;
    document.getElementById('rateValue').textContent = rate.toFixed(1) + '%';
    document.getElementById('inheritAgeValue').textContent = inheritAge;
    document.getElementById('inheritTaxValue').textContent = inheritTax + '%';
    document.getElementById('capitalGainsTaxValue').textContent = capitalGainsTax + '%';
    
    // Calculate
    const data = calculateScenarios(price, downPaymentPct, rent, inflation, buyAge, rate, inheritAge, inheritTax, capitalGainsTax);
    
    // Update displays
    updateAllDisplays(data);
    renderCharts(data);
}

// TAB NAVIGATION
document.addEventListener('DOMContentLoaded', function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Deactivate all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Activate selected
            this.classList.add('active');
            document.getElementById(tabName + '-tab').classList.add('active');
            
            // Resize charts on tab change
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100);
        });
    });
    
    // EVENT LISTENERS
    document.getElementById('priceSlider').addEventListener('input', update);
    document.getElementById('downPaymentSlider').addEventListener('input', update);
    document.getElementById('rentSlider').addEventListener('input', update);
    document.getElementById('inflationSlider').addEventListener('input', update);
    document.getElementById('buyAgeSlider').addEventListener('input', update);
    document.getElementById('rateSlider').addEventListener('input', update);
    document.getElementById('inheritAgeSlider').addEventListener('input', update);
    document.getElementById('inheritTaxSlider').addEventListener('input', update);
    document.getElementById('capitalGainsTaxSlider').addEventListener('input', update);
    
    // INITIAL CALCULATION
    update();
    
    // RESIZE HANDLER
    window.addEventListener('resize', () => {
        echo arts.util.getInstances().forEach(c => c.resize());
    });
});
