import { useState, useEffect } from "react";
import { C, styles, adminStyles } from "./styles";

const fmt = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function AdminPanel() {
  const [autenticado, setAutenticado] = useState(false);
  const [senhaDigitada, setSenhaDigitada] = useState("");

  // ─── O ADMIN AGORA TEM O SEU PRÓPRIO ESTADO DE MENU ───
  const [menu, setMenu] = useState([]);

  const [idEmEdicao, setIdEmEdicao] = useState(null);
  const [novoNome, setNovoNome] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [preco250, setPreco250] = useState("");
  const [preco350, setPreco350] = useState("");
  const [preco500, setPreco500] = useState("");

  // ─── FUNÇÃO PARA BUSCAR OS PRATOS DIRETAMENTE DO BANCO ───
  const carregarMenu = () => {
    fetch("https://giufit-backend.onrender.com/pratos")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const pratosFormatados = data.map((prato) => ({
          id: prato.id,
          nome: prato.nome || "Sem Nome",
          descricao: prato.descricao || "",
          tamanhos: [
            { tamanho: "250g", preco: Number(prato.preco_250g) || 0 },
            { tamanho: "350g", preco: Number(prato.preco_350g) || 0 },
            { tamanho: "500g", preco: Number(prato.preco_500g) || 0 },
          ],
        }));
        setMenu(pratosFormatados);
      })
      .catch((err) => console.error("Erro ao carregar o menu:", err));
  };

  // Carrega os dados APENAS quando o utilizador acertar a senha
  useEffect(() => {
    if (autenticado) {
      carregarMenu();
    }
  }, [autenticado]);

  const handleLogin = (e) => {
    e.preventDefault();
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
    if (window.confirm("Tem a certeza que deseja eliminar esta marmita?")) {
      fetch(`https://giufit-backend.onrender.com/pratos/${id}`, {
        method: "DELETE",
      })
        .then(() => {
          carregarMenu();
          if (idEmEdicao === id) limparFormulario();
        })
        .catch((err) => console.error(err));
    }
  };

  const iniciarEdicao = (prato) => {
    setIdEmEdicao(prato.id);
    setNovoNome(prato.nome);
    setNovaDescricao(prato.descricao);

    const p250 = prato.tamanhos.find((t) => t.tamanho === "250g");
    const p350 = prato.tamanhos.find((t) => t.tamanho === "350g");
    const p500 = prato.tamanhos.find((t) => t.tamanho === "500g");

    setPreco250(p250 && p250.preco > 0 ? p250.preco : "");
    setPreco350(p350 && p350.preco > 0 ? p350.preco : "");
    setPreco500(p500 && p500.preco > 0 ? p500.preco : "");
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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "40px 20px",
        }}
      >
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
            Entrar no Painel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", padding: "20px" }}>
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
          {/* O PONTO DE INTERROGAÇÃO AQUI É O NOSSO ESCUDO DE PROTEÇÃO */}
          <h3 style={{ ...styles.cardName, fontSize: 20, marginBottom: 20 }}>
            📋 Pratos Ativos ({menu?.length || 0})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {!menu || menu.length === 0 ? (
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
