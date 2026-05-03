document.addEventListener('DOMContentLoaded', () => {
  // Select de moeda de origem
  const fromCurrency = document.getElementById('fromCurrency');
  // Select de moeda de destino
  const toCurrency = document.getElementById('toCurrency');
  // Input do valor digitado pelo usuário
  const amountInput = document.getElementById('amount');
  // Form principal do conversor
  const converterForm = document.getElementById('converterForm');
  // Elemento onde será exibido o resultado final
  const resultEl = document.getElementById('result');
  // Elemento que mostra a taxa usada na conversão
  const rateInfoEl = document.getElementById('rateInfo');
  // Elemento que mostra a última atualização da API
  const lastUpdatedEl = document.getElementById('lastUpdated');
  // Botão de conversão
  const convertBtn = document.getElementById('convertBtn');

  // MOEDAS 
  const CURRENCIES = [
    { code: 'USD', name: 'Dólar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'BRL', name: 'Real' },
    { code: 'GBP', name: 'Libra' },
    { code: 'JPY', name: 'Iene' }
  ];

  // Objeto onde serão armazenadas as taxas da API
  let rates = {};

  // POPULAR SELECTS
  function populateSelects() {
    // Percorre todas as moedas e cria opções no select
    CURRENCIES.forEach(c => {
      // Opção para moeda de origem
      fromCurrency.add(
        new Option(`${c.code} - ${c.name}`, c.code)
      );
      // Opção para moeda de destino
      toCurrency.add(
        new Option(`${c.code} - ${c.name}`, c.code)
      );
    });
    // Valores padrão ao carregar a página
    fromCurrency.value = 'USD';
    toCurrency.value = 'BRL';
  }

  // FORMATAR MOEDA
  function formatCurrency(amount, currency) {
    // Usa API nativa do JavaScript para formatar moeda corretamente
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency
    }).format(amount);
  }

  // CARREGAR TAXAS DA API
  async function loadRates() {
    try {
      // Requisição para API de câmbio (base USD)
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      // Converte resposta para JSON
      const data = await res.json();
      // Armazena taxas no objeto global
      rates = data.rates;
      // Mostra data de atualização na interface
      lastUpdatedEl.textContent =
        `Atualizado: ${data.time_last_update_utc}`;
    } catch (error) {
      // Caso a API falhe
      resultEl.textContent = "Erro ao carregar taxas";
      console.error("Erro na API:", error);
    }
  }

  // CONVERSÃO DE MOEDAS
  function convertCurrency(amount, from, to) {
    // Validação: valor inválido
    if (!amount || amount <= 0) {
      resultEl.textContent = "Digite um valor válido";
      return;
    }
    // Validação: moedas iguais
    if (from === to) {
      resultEl.textContent = "Selecione moedas diferentes";
      return;
    }
    // Feedback visual de carregamento no botão
    convertBtn.disabled = true;
    convertBtn.innerText = "Convertendo...";

    try {
      // Conversão baseada em USD como moeda intermediária
      const amountInUSD = amount / rates[from];
      const converted = amountInUSD * rates[to];
      // Mostra resultado formatado
      resultEl.textContent =
        `${formatCurrency(amount, from)} = ${formatCurrency(converted, to)}`;
      // Mostra taxa de conversão usada
      rateInfoEl.textContent =
        `1 ${from} = ${(rates[to] / rates[from]).toFixed(4)} ${to}`;
    } catch (error) {
      // Caso algo falhe no cálculo
      resultEl.textContent = "Erro na conversão";
      console.error("Erro conversão:", error);
    }
    // Reativa botão após cálculo
    convertBtn.disabled = false;
    convertBtn.innerText = "Converter";
  }

  // EVENTO DO FORMULÁRIO
  converterForm.addEventListener('submit', (e) => {
    // Impede recarregamento da página
    e.preventDefault();
    // Executa conversão
    convertCurrency(
      amountInput.value,
      fromCurrency.value,
      toCurrency.value
    );
  });

  // INICIALIZAÇÃO DO APP
  populateSelects(); // Preenche selects
  loadRates();       // Carrega taxas da API
});