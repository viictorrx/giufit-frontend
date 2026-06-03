// src/AdminPanel.jsx
import { useState } from "react";
import { C, styles, adminStyles } from "./styles";

const fmt = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function AdminPanel({ menu, carregarMenu, setView }) {
  const [autenticado, setAutenticado] = useState(false);
  const [senhaDigitada, setSenhaDigitada] = useState("");

  // ─── NOVO ESTADO PARA CONTROLO DE EDIÇÃO ───
  const [idEmEdicao, setIdEmEdicao] = useState(null); // Guarda o ID se estiver a editar

  const [novoNome, setNovoNome] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [preco250, setPreco250] = useState("");
  const [preco350, setPreco350] = useState("");
  const [preco500, setPreco500] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Agora o React vai buscar a senha guardada no ficheiro .env!
    if (senhaDigitada === import.meta.env.VITE_ADMIN_PASSWORD) {
      setAutenticado(true);
      setSenhaDigitada("");
    } else {
      alert("Senha incorreta!");
      setSenhaDigitada("");
    }
  };

  const handleSalvarPrato = (e) => {
    e.preventDefault();
    const opcoes = [];
    if (preco250) opcoes.push({ tamanho: "250g", preco: parseFloat(preco250) });
    if (preco350) opcoes.push({ tamanho: "350g", preco: parseFloat(preco350) });
    if (preco500) opcoes.push({ tamanho: "500g", preco: parseFloat(preco500) });

    if (!novoNome || opcoes.length === 0) {
      alert("Por favor, preencha o nome e pelo menos um preço!");
      return;
    }

    // Se houver um idEmEdicao, faz PUT para atualizar. Se não, faz POST para criar novo.
    const url = idEmEdicao
      ? `https://giufit-backend.onrender.com/pratos/${idEmEdicao}`
      : "https://giufit-backend.onrender.com/pratos";
    const method = idEmEdicao ? "PUT" : "POST";

    fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: novoNome,
        descricao: novaDescricao,
        ativo: true,
        opcoes: opcoes,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        carregarMenu();
        limparFormulario();
        alert(
          idEmEdicao
            ? "Marmita atualizada com sucesso!"
            : "Marmita cadastrada com sucesso!",
        );
      })
      .catch((err) => alert("Erro ao salvar: " + err));
  };

  const handleDeletarPrato = (id) => {
    if (confirm("Tem a certeza que deseja eliminar esta marmita?")) {
      fetch(`https://giufit-backend.onrender.com/pratos/${id}`, {
        method: "DELETE",
      })
        .then(() => {
          carregarMenu();
          if (idEmEdicao === id) limparFormulario(); // Cancela a edição se o prato for apagado
        })
        .catch((err) => console.error(err));
    }
  };

  // Função que puxa os dados do prato de volta para as caixas de texto
  const iniciarEdicao = (prato) => {
    setIdEmEdicao(prato.id);
    setNovoNome(prato.nome);
    setNovaDescricao(prato.descricao);

    // Procura os preços antigos para preencher os inputs
    const p250 = prato.tamanhos.find((t) => t.tamanho === "250g");
    const p350 = prato.tamanhos.find((t) => t.tamanho === "350g");
    const p500 = prato.tamanhos.find((t) => t.tamanho === "500g");

    setPreco250(p250 ? p250.preco : "");
    setPreco350(p350 ? p350.preco : "");
    setPreco500(p500 ? p500.preco : "");
  };

  const limparFormulario = () => {
    setIdEmEdicao(null);
    setNovoNome("");
    setNovaDescricao("");
    setPreco250("");
    setPreco350("");
    setPreco500("");
  };

  if (!autenticado) {
    return (
      <form
        onSubmit={handleLogin}
        style={{
          background: "#fff",
          padding: 40,
          borderRadius: 24,
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          width: "100%",
          maxWidth: 400,
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: 48, display: "block", marginBottom: 10 }}>
          🔒
        </span>
        <h2 style={{ ...styles.menuTitle, fontSize: 24, marginBottom: 6 }}>
          Área Restrita
        </h2>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>
          Digite a senha de administrador.
        </p>
        <input
          type="password"
          placeholder="Senha secreta..."
          value={senhaDigitada}
          onChange={(e) => setSenhaDigitada(e.target.value)}
          style={{
            ...adminStyles.input,
            textAlign: "center",
            fontSize: 16,
            letterSpacing: 2,
          }}
          required
        />
        <button
          type="submit"
          style={{
            ...styles.heroBtn,
            width: "100%",
            border: "none",
            cursor: "pointer",
            marginTop: 20,
          }}
        >
          Entrar no Panel
        </button>
        <button
          type="button"
          onClick={() => setView("loja")}
          style={{
            background: "none",
            border: "none",
            color: C.pink,
            marginTop: 16,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Voltar para a Loja
        </button>
      </form>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      <div style={styles.menuHeader}>
        <h2 style={styles.menuTitle}>⚙️ Painel de Gestão GiuFit</h2>
        <p style={styles.menuSub}>
          Adicione, edite ou remova pratos do cardápio em tempo real
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 40,
          alignItems: "flex-start",
        }}
      >
        {/* Formulário Dinâmico */}
        <form
          onSubmit={handleSalvarPrato}
          style={{
            flex: "1 1 400px",
            background: "#fff",
            padding: 32,
            borderRadius: 24,
            boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
          }}
        >
          <h3
            style={{
              ...styles.cardName,
              fontSize: 20,
              marginBottom: 20,
              color: idEmEdicao ? C.pink : C.green,
            }}
          >
            {idEmEdicao ? "✏️ Editando Marmita" : "➕ Cadastrar Nova Marmita"}
          </h3>

          <label style={adminStyles.label}>Nome do Prato</label>
          <input
            type="text"
            placeholder="Ex: Escondidinho de Patinho"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            style={adminStyles.input}
            required
          />

          <label style={adminStyles.label}>Descrição</label>
          <textarea
            placeholder="Ingredientes..."
            value={novaDescricao}
            onChange={(e) => setNovaDescricao(e.target.value)}
            style={{ ...adminStyles.input, height: 80, resize: "none" }}
          />

          <label
            style={{ ...adminStyles.label, marginBottom: 12, display: "block" }}
          >
            Preços por Tamanho
          </label>
          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 12, color: C.muted }}>250g</span>
              <input
                type="number"
                step="0.01"
                placeholder="R$ 0.00"
                value={preco250}
                onChange={(e) => setPreco250(e.target.value)}
                style={adminStyles.input}
              />
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 12, color: C.muted }}>350g</span>
              <input
                type="number"
                step="0.01"
                placeholder="R$ 0.00"
                value={preco350}
                onChange={(e) => setPreco350(e.target.value)}
                style={adminStyles.input}
              />
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 12, color: C.muted }}>500g</span>
              <input
                type="number"
                step="0.01"
                placeholder="R$ 0.00"
                value={preco500}
                onChange={(e) => setPreco500(e.target.value)}
                style={adminStyles.input}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              ...styles.heroBtn,
              width: "100%",
              border: "none",
              cursor: "pointer",
              background: idEmEdicao ? C.pink : C.green,
            }}
          >
            {idEmEdicao
              ? "Atualizar Dados da Marmita"
              : "Guardar Marmita no Cardápio"}
          </button>

          {idEmEdicao && (
            <button
              type="button"
              onClick={limparFormulario}
              style={{
                background: "none",
                border: "none",
                color: C.muted,
                width: "100%",
                marginTop: 12,
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Cancelar Edição
            </button>
          )}
        </form>

        {/* Lista de Pratos com Opção de Editar e Eliminar */}
        <div style={{ flex: "1 1 400px" }}>
          <h3 style={{ ...styles.cardName, fontSize: 20, marginBottom: 20 }}>
            📋 Pratos Ativos ({menu.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {menu.length === 0 ? (
              <p style={{ color: C.muted }}>Nenhum prato cadastrado.</p>
            ) : (
              menu.map((p) => (
                <div
                  key={p.id}
                  style={{
                    background: "#fff",
                    padding: "16px 20px",
                    borderRadius: 16,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <strong style={{ color: C.text }}>{p.nome}</strong>
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      {p.tamanhos.map((t) => (
                        <span
                          key={t.tamanho}
                          style={{
                            fontSize: 11,
                            background: C.creamDark,
                            padding: "2px 6px",
                            borderRadius: 4,
                            color: C.muted,
                          }}
                        >
                          {t.tamanho}: {fmt(t.preco)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => iniciarEdicao(p)}
                      style={{
                        background: C.creamDark,
                        color: C.text,
                        border: "none",
                        borderRadius: 8,
                        padding: "8px 12px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      Editar ✏️
                    </button>
                    <button
                      onClick={() => handleDeletarPrato(p.id)}
                      style={{
                        background: "#fee2e2",
                        color: "#ef4444",
                        border: "none",
                        borderRadius: 8,
                        padding: "8px 12px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
