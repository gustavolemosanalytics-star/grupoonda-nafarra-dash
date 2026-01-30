const {
    getZigData,
    getFinanceData,
    getIngresseTimelineData,
    getIngresseComissarioData,
    getIngresseGeneroData,
    getIngresseIdadeData,
    getIngressePagamentoData,
    getIngresseEstadoData,
    getIngresseCidadeData
} = require('./src/lib/sheets');

async function test() {
    console.log('Testing ZIG...');
    try { await getZigData(); console.log('ZIG OK'); } catch (e) { console.error('ZIG FAIL:', e.message); }

    console.log('Testing FINANCE...');
    try { await getFinanceData(); console.log('FINANCE OK'); } catch (e) { console.error('FINANCE FAIL:', e.message); }

    console.log('Testing TIMELINE...');
    try { await getIngresseTimelineData(); console.log('TIMELINE OK'); } catch (e) { console.error('TIMELINE FAIL:', e.message); }

    console.log('Testing COMISSARIOS...');
    try { await getIngresseComissarioData(); console.log('COMISSARIOS OK'); } catch (e) { console.error('COMISSARIOS FAIL:', e.message); }

    console.log('Testing GENERO...');
    try { await getIngresseGeneroData(); console.log('GENERO OK'); } catch (e) { console.error('GENERO FAIL:', e.message); }

    console.log('Testing IDADE...');
    try { await getIngresseIdadeData(); console.log('IDADE OK'); } catch (e) { console.error('IDADE FAIL:', e.message); }

    console.log('Testing PAGAMENTO...');
    try { await getIngressePagamentoData(); console.log('PAGAMENTO OK'); } catch (e) { console.error('PAGAMENTO FAIL:', e.message); }

    console.log('Testing ESTADO...');
    try { await getIngresseEstadoData(); console.log('ESTADO OK'); } catch (e) { console.error('ESTADO FAIL:', e.message); }

    console.log('Testing CIDADE...');
    try { await getIngresseCidadeData(); console.log('CIDADE OK'); } catch (e) { console.error('CIDADE FAIL:', e.message); }
}

test();
