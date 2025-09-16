// Seletores principais
const botaoCarrinho = document.querySelector(".botao-carrinho");
const modalCarrinho = document.getElementById("modal-carrinho");
const fecharCarrinho = document.getElementById("fechar-carrinho");
const tabelaCarrinho = document.querySelector(".tabela-carrinho tbody");
const totalCarrinho = document.querySelector(".carrinho-total p");
const contadorCarrinho = document.querySelector(".botao-carrinho span");

// Abrir modal
botaoCarrinho.addEventListener("click", () => {
    modalCarrinho.style.display = "flex";
});

// Fechar modal
fecharCarrinho.addEventListener("click", () => {
    modalCarrinho.style.display = "none";
});

// Fechar clicando fora
window.addEventListener("click", (e) => {
    if (e.target === modalCarrinho) {
        modalCarrinho.style.display = "none";
    }
});

// Adicionar ao carrinho
document.querySelectorAll(".btn-add").forEach((botao) => {
    botao.addEventListener("click", (e) => {
        const produto = e.target.closest(".produto");
        const nome = produto.dataset.nome;
        const preco = parseFloat(produto.dataset.preco);
        const img = produto.dataset.img;

        // Verifica se já existe no carrinho
        let existente = Array.from(tabelaCarrinho.querySelectorAll("tr")).find(
            (linha) => linha.dataset.nome === nome
        );

        if (existente) {
            let qtdInput = existente.querySelector("input");
            qtdInput.value = parseInt(qtdInput.value) + 1;
        } else {
            const linha = document.createElement("tr");
            linha.dataset.nome = nome;
            linha.innerHTML = `
        <td><img src="${img}" alt="${nome}"></td>
        <td>${nome}</td>
        <td>R$ ${preco.toFixed(2).replace(".", ",")}</td>
        <td><input type="number" value="1" min="1"></td>
        <td>R$ ${preco.toFixed(2).replace(".", ",")}</td>
        <td><button class="btn-deletar">Deletar</button></td>
      `;
            tabelaCarrinho.appendChild(linha);
        }

        atualizarTotal();
    });
});

// Atualizar total
function atualizarTotal() {
    let total = 0;
    let quantidadeTotal = 0;

    tabelaCarrinho.querySelectorAll("tr").forEach((linha) => {
        const precoTexto = linha.querySelector("td:nth-child(3)").innerText.replace("R$", "").replace(",", ".");
        const quantidade = linha.querySelector