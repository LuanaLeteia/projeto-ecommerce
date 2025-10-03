/*
Objetivo 1 - quando clicar no botão de adicionar ao carrinho:
    - atualizar o contador
    - adicionar o produto no localStorage
    - atualizar a tabela HTML do carrinho

Objetivo 2 - remover produtos do carrinho:
    - ouvir o botão de deletar
    - remover do localStorage
    - atualizar o DOM e o total

Objetivo 3 - atualizar valores do carrinho:
    - ouvir mudanças de quantidade
    - recalcular total individual
    - recalcular total geral
*/

document.addEventListener('DOMContentLoaded', () => {
  // Inicializa MicroModal se disponível (faz o botão com data-micromodal-trigger funcionar)
  if (window.MicroModal && typeof MicroModal.init === 'function') {
    MicroModal.init(); // -> ativa triggers data-micromodal-trigger / data-micromodal-close
  }

  // Seletores principais (confira nomes exatos no HTML)
  const botoesAdicionarAoCarrinho = document.querySelectorAll('.adicionar-ao-carrinho');
  const contadorCarrinho = document.getElementById('contador-carrinho');
  const tabelaCarrinho = document.querySelector('#modal-1-content tbody');
  const totalCarrinho = document.getElementById('total-carrinho');

  // Validação básica — se algum elemento obrigatório faltar, mostra erro no console e aborta.
  if (!contadorCarrinho) {
    console.error('Elemento com id "contador-carrinho" não encontrado no DOM.');
    return;
  }
  if (!tabelaCarrinho) {
    console.error('Tabela do modal (selector: "#modal-1-content tbody") não encontrada no DOM.');
    return;
  }
  if (!totalCarrinho) {
    console.error('Elemento com id "total-carrinho" não encontrado no DOM.');
    return;
  }

  // Helper: parseia texto tipo "R$ 1.234,56" pra number 1234.56
  function parseBRLParaNumero(texto) {
    if (!texto) return 0;
    // remove tudo que não seja dígito, ponto ou vírgula
    const somente = texto.replace(/[^\d.,-]/g, '');
    // remove pontos de milhares e transforma vírgula decimal em ponto
    const normalizado = somente.replace(/\./g, '').replace(/,/g, '.');
    const n = parseFloat(normalizado);
    return isNaN(n) ? 0 : n;
  }

  // LocalStorage helpers
  function obterProdutosDoCarrinho() {
    const itens = localStorage.getItem('carrinho');
    return itens ? JSON.parse(itens) : [];
  }
  function salvarCarrinho(carrinho) {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
  }

  // Atualiza contador, tabela e total (re-render)
  function atualizarCarrinho() {
    const carrinho = obterProdutosDoCarrinho();

    // contador (total de itens)
    const totalItens = carrinho.reduce((acc, p) => acc + (p.quantidade || 0), 0);
    contadorCarrinho.textContent = totalItens;

    // limpa tabela
    tabelaCarrinho.innerHTML = '';

    // renderiza linhas
    carrinho.forEach((produto, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="td-produto">
          <img src="${produto.imagem}" alt="${produto.nome}">
        </td>
        <td>${produto.nome}</td>
        <td class="td-preco-unitario">R$ ${produto.preco.toFixed(2).replace('.', ',')}</td>
        <td class="td-quantidade">
          <input type="number" value="${produto.quantidade}" min="1" data-index="${idx}">
        </td>
        <td class="td-preco-total">R$ ${(produto.preco * produto.quantidade).toFixed(2).replace('.', ',')}</td>
        <td><button class="btn-remover" data-index="${idx}" aria-label="Remover item"></button></td>
      `;
      tabelaCarrinho.appendChild(tr);
    });

    atualizarTotal();
    adicionarEventosDinamicos();
  }

  // Atualiza texto do total
  function atualizarTotal() {
    const carrinho = obterProdutosDoCarrinho();
    const soma = carrinho.reduce((acc, p) => acc + (p.preco * p.quantidade), 0);
    // garante o mesmo formato: "Total: R$ 0,00"
    totalCarrinho.textContent = `Total: R$ ${soma.toFixed(2).replace('.', ',')}`;
  }

  // Adiciona eventos aos inputs e botões gerados dinamicamente na tabela
  function adicionarEventosDinamicos() {
    // remover
    document.querySelectorAll('.btn-remover').forEach(botao => {
      botao.addEventListener('click', () => {
        const idx = Number(botao.dataset.index);
        let carrinho = obterProdutosDoCarrinho();
        if (!Number.isNaN(idx) && carrinho[idx]) {
          carrinho.splice(idx, 1);
          salvarCarrinho(carrinho);
          atualizarCarrinho();
        }
      });
    });

    // mudança de quantidade
    document.querySelectorAll('.td-quantidade input').forEach(input => {
      input.addEventListener('change', () => {
        const idx = Number(input.dataset.index);
        let novaQtd = parseInt(input.value, 10);
        if (isNaN(novaQtd) || novaQtd < 1) novaQtd = 1;
        const carrinho = obterProdutosDoCarrinho();
        if (carrinho[idx]) {
          carrinho[idx].quantidade = novaQtd;
          salvarCarrinho(carrinho);
          atualizarCarrinho();
        }
      });
    });
  }

  // Adiciona produto (evento dos botões)
  botoesAdicionarAoCarrinho.forEach(botao => {
    botao.addEventListener('click', (evento) => {
      const elementoProduto = evento.target.closest('.produto');
      if (!elementoProduto) return; // proteção

      const produtoId = elementoProduto.dataset.id || String(Date.now()); // fallback id
      const produtoNome = elementoProduto.querySelector('.nome') ? elementoProduto.querySelector('.nome').textContent.trim() : 'Produto';
      const produtoImagemEl = elementoProduto.querySelector('img');
      const produtoImagem = produtoImagemEl ? produtoImagemEl.getAttribute('src') : '';
      const precoTextoEl = elementoProduto.querySelector('.preco');
      const produtoPreco = parseBRLParaNumero(precoTextoEl ? precoTextoEl.textContent : '');

      const carrinho = obterProdutosDoCarrinho();
      const existe = carrinho.find(p => p.id === produtoId);

      if (existe) {
        existe.quantidade = (existe.quantidade || 0) + 1;
      } else {
        carrinho.push({
          id: produtoId,
          nome: produtoNome,
          imagem: produtoImagem,
          preco: produtoPreco,
          quantidade: 1
        });
      }

      salvarCarrinho(carrinho);
      atualizarCarrinho();

      // opcional: abrir o modal automaticamente após adicionar
      // se MicroModal estiver disponível, utiliza trigger (atributo já presente no botão do header)
      // caso contrário, abre manualmente adicionando a classe is-open ao modal
      const modal = document.getElementById('modal-1');
      if (modal) {
        if (window.MicroModal && typeof MicroModal.show === 'function') {
          MicroModal.show('modal-1');
        } else {
          modal.classList.add('is-open');
        }
      }
    });
  });

  // inicializa a UI com itens existentes no localStorage
  atualizarCarrinho();
});