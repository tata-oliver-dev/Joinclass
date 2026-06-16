const FATORES = {
    'alto-forno': 2.1,
    'eletrico':   0.6,
    'direto':     1.4,
};

const REDUCOES = {
    'reciclagem':        0.20,
    'energia-renovavel': 0.15,
    'niobio':            0.08,
    'ccus':              0.25,
};

const LABELS_TEC = {
    'reciclagem':        'Reciclagem de sucata',
    'energia-renovavel': 'Energia renovavel',
    'niobio':            'Uso de niobio',
    'ccus':              'Captura de carbono',
};

function fmt(n) {
    const num = parseFloat(n);
    if (isNaN(num)) return '—';
    return num.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
}

function calcularEmissoes() {
    const volumeStr = document.getElementById('volume').value.trim();
    const processo  = document.getElementById('processo').value;
    const tecAtivas = [...document.querySelectorAll('input[name="tec"]:checked')].map(el => el.value);
    const area      = document.getElementById('resultado-dinamico');

    const volume = parseFloat(volumeStr);

    if (!volumeStr || isNaN(volume) || volume <= 0) {
        area.innerHTML = erro('Informe um volume de producao valido (ex: 50000).');
        return;
    }
    if (!processo || !FATORES[processo]) {
        area.innerHTML = erro('Selecione o processo de producao utilizado.');
        return;
    }

    const fator       = FATORES[processo];
    const emissaoBase = volume * fator;

    const reducaoTotal = Math.min(
        tecAtivas.reduce((acc, t) => acc + (REDUCOES[t] || 0), 0),
        0.80
    );

    const emissaoFinal = emissaoBase * (1 - reducaoTotal);
    const economizado  = emissaoBase - emissaoFinal;
    const percentual   = Math.round(reducaoTotal * 100);
    const fatorPorTon  = emissaoFinal / volume;

    let nivel, corBadge, explicacao;
    if (fatorPorTon < 0.5) {
        nivel      = 'Baixo impacto';
        corBadge   = 'verde';
        explicacao = 'Sua producao esta alinhada com as metas globais de descarbonizacao. Excelente resultado.';
    } else if (fatorPorTon < 1.2) {
        nivel      = 'Impacto moderado';
        corBadge   = 'ambar';
        explicacao = 'Ha espaco para reducao. Adotar mais tecnologias pode aproximar sua planta do padrao sustentavel.';
    } else {
        nivel      = 'Alto impacto';
        corBadge   = 'vermelho';
        explicacao = 'Sua emissao esta acima da media do setor. As tecnologias do Forja Verde podem reduzir significativamente esse valor.';
    }

    const barraLargura = Math.max(5, 100 - percentual);

    const listaTec = tecAtivas.length > 0
        ? tecAtivas.map(t => `
            <li>
                <span>${LABELS_TEC[t]}</span>
                <span class="tec-reducao">-${Math.round(REDUCOES[t] * 100)}%</span>
            </li>`).join('')
        : '<li class="sem-tec">Nenhuma tecnologia selecionada</li>';

    area.innerHTML = `
        <div class="res-bloco res-topo">
            <span class="resultado-badge resultado-badge--${corBadge}">${nivel}</span>
            <p class="res-explicacao">${explicacao}</p>
        </div>

        <div class="res-bloco">
            <p class="res-rotulo">Emissao estimada com as melhorias</p>
            <p class="res-numero">${fmt(emissaoFinal)} <span>tCO2/ano</span></p>
        </div>

        <div class="res-barra-wrap">
            <div class="res-barra-label">
                <span>Emissao sem melhorias: <strong>${fmt(emissaoBase)} tCO2</strong></span>
                <span>Reducao: <strong>${percentual}%</strong></span>
            </div>
            <div class="res-barra-fundo">
                <div class="res-barra-fill" style="width:${barraLargura}%"></div>
            </div>
            <div class="res-barra-label">
                <span class="res-label-antes">${fmt(emissaoBase)} tCO2</span>
                <span class="res-label-depois">→ ${fmt(emissaoFinal)} tCO2</span>
            </div>
        </div>

        <div class="res-bloco res-economia">
            <p class="res-rotulo">Voce deixaria de emitir por ano</p>
            <p class="res-numero res-numero--destaque">${fmt(economizado)} <span>tCO2</span></p>
            <p class="res-analogia">${analogia(economizado)}</p>
        </div>

        <div class="res-bloco">
            <p class="res-rotulo">Tecnologias consideradas</p>
            <ul class="res-lista-tec">${listaTec}</ul>
        </div>
    `;
}

function analogia(toneladas) {
    const carros = Math.round(toneladas / 2);
    if (carros < 1) return '';
    const label = carros === 1 ? 'carro' : 'carros';
    return `Equivalente a retirar ${fmt(carros)} ${label} de circulacao por um ano.`;
}

function erro(msg) {
    return `<p class="resultado-erro">${msg}</p>`;
}

// INICIALIZACAO
document.addEventListener('DOMContentLoaded', () => {

    const area = document.querySelector('.simulador-resultado');
    area.innerHTML = '<div id="resultado-dinamico" class="resultado-placeholder"><p>Preencha os dados ao lado e clique em <strong>Calcular emissoes</strong> para ver o resultado.</p></div>';

    document.querySelector('.btn-simulador')
        .addEventListener('click', calcularEmissoes);

    // Link ativo na nav conforme scroll
    const secoes   = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(a => a.classList.remove('ativo'));
                const link = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
                if (link) link.classList.add('ativo');
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    secoes.forEach(s => observer.observe(s));
});