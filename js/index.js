// Seletores principais
const botaoCarrinho = document.querySelector(".botao-carrinho");
const modalCarrinho = document.getElementById("modal-carrinho");
const fecharCarrinho = document.getElementById("fechar-carrinho");
const tabelaCarrinho = document.querySelector(".tabela-carrinho tbody");
const totalCarrinho = document.querySelector(".carrinho-total p");

// Abrir modal
botaoCarrinho.addEventListener("click", () => {
    modalCarrinho.style.display = "flex";
});

// Fechar modal
fecharCarrinho.addEventListener("click", () => {
    modalCarrinho.style.display = "none";
});

// Fechar clicando fora do conteúdo
window.addEventListener("click", (e) => {
    if (e.target === modalCarrinho) {
        modalCarrinho.style.display = "none";
    }
});

// Atualizar total
function atualizarTotal() {
    let total = 0;

    tabelaCarrinho.querySelectorAll("tr").forEach((linha) => {
        const precoTexto = linha.querySelector("td:nth-child(3)").innerText.replace("R$", "").replace(",", ".");
        const quantidade = linha.querySelector("input").value;
        const subtotal = parseFloat(precoTexto) * parseInt(quantidade);

        linha.querySelector("td:nth-child(5)").innerText = `R$ ${subtotal.toFixed(2).replace(".", ",")}`;

        total += subtotal;
    });

    totalCarrinho.innerText = `Total: R$ ${total.toFixed(2).replace(".", ",")}`;
}

// Detectar mudança de quantidade
tabelaCarrinho.addEventListener("input", (e) => {
    if (e.target.type === "number") {
        atualizarTotal();
    }
});

// Deletar produto
tabelaCarrinho.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-deletar")) {
        e.target.closest("tr").remove();
        atualizarTotal();
    }
});

// Inicializa total
atualizarTotal();