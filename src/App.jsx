// src/App.jsx
import { useState, useEffect } from "react";
import { C, styles } from "./styles";
import CartSidebar from "./CartSidebar";
import AdminPanel from "./AdminPanel";

const fmt = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function GiuFitStore() {
  const [carrinho, setCarrinho] = useState([]);
  const [selecionados, setSelecionados] = useState({});
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [pedidoFeito, setPedidoFeito] = useState(false);
  const [scroll, setScroll] = useState(0);
  const [menu, setMenu] = useState([]);
  const [view, setView] = useState("loja");

  const carregarMenu = () => {
    // Linha atualizada para buscar os dados direto da nuvem no Render!
    fetch("https://giufit-backend.onrender.com/pratos")
      .then((res) => res.json())
      .then((data) => {
        const cardapioAdaptado = data.map((prato) => ({
          ...prato,
          emoji: "🍱",
          tamanhos: prato.opcoes,
        }));
        setMenu(cardapioAdaptado);
      })
      .catch((err) => console.error("Erro ao procurar o cardápio:", err));
  };

  useEffect(() => {
    carregarMenu();
  }, []);

  useEffect(() => {
    const onScroll = () => setScroll(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const setSel = (pratoId, tamanho) => {
    setSelecionados((s) => ({ ...s, [pratoId]: tamanho }));
  };

  const adicionarAoCarrinho = (prato) => {
    const tam = selecionados[prato.id] || prato.tamanhos[0]?.tamanho;
    const info = prato.tamanhos.find((t) => t.tamanho === tam);
    if (!info) return;
    const chave = `${prato.id}-${tam}`;
    setCarrinho((c) => {
      const existe = c.find((i) => i.chave === chave);
      if (existe)
        return c.map((i) => (i.chave === chave ? { ...i, qtd: i.qtd + 1 } : i));
      return [
        ...c,
        {
          chave,
          pratoId: prato.id,
          nome: prato.nome,
          emoji: prato.emoji,
          tamanho: tam,
          preco: info.preco,
          qtd: 1,
        },
      ];
    });
    setCarrinhoAberto(true);
  };

  const altQtd = (chave, delta) =>
    setCarrinho((c) =>
      c
        .map((i) => (i.chave === chave ? { ...i, qtd: i.qtd + delta } : i))
        .filter((i) => i.qtd > 0),
    );
  const total = carrinho.reduce((s, i) => s + i.preco * i.qtd, 0);
  const totalItens = carrinho.reduce((s, i) => s + i.qtd, 0);

  const finalizarPedido = () => {
    const lines = carrinho
      .map(
        (i) => `• ${i.qtd}x ${i.nome} (${i.tamanho}) — ${fmt(i.preco * i.qtd)}`,
      )
      .join("%0A");
    const msg = `Olá GiuFit! Quero fazer um pedido:%0A%0A${lines}%0A%0A*Total: ${fmt(total)}*`;
    window.open(`https://wa.me/5511976373639?text=${msg}`, "_blank");
    setPedidoFeito(true);
    setCarrinho([]);
    setCarrinhoAberto(false);
    setTimeout(() => setPedidoFeito(false), 4000);
  };

  return (
    <div style={styles.root}>
      {/* ─── NAVBAR ─── */}
      <nav
        style={{
          ...styles.nav,
          background:
            scroll > 60 || view === "admin"
              ? "rgba(255,252,246,0.97)"
              : "transparent",
          boxShadow:
            scroll > 60 || view === "admin"
              ? "0 2px 20px rgba(0,0,0,0.08)"
              : "none",
        }}
      >
        <div
          onClick={() => setView("loja")}
          style={{ ...styles.navLogo, cursor: "pointer" }}
        >
          <img
            src="/giufitlogoo.png"
            alt="Logo GiuFit"
            style={{ height: "70px", objectFit: "contain" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {view === "loja" ? (
            <button
              style={{
                ...styles.tamBtn,
                border: `2px solid ${C.pink}`,
                color: C.pink,
                background: "transparent",
              }}
              onClick={() => setView("admin")}
            >
              ⚙️ Painel Admin
            </button>
          ) : (
            <button
              style={{
                ...styles.tamBtn,
                border: `2px solid ${C.green}`,
                color: C.green,
                background: "transparent",
              }}
              onClick={() => setView("loja")}
            >
              🏪 Ver Loja
            </button>
          )}
          {view === "loja" && (
            <button
              style={styles.cartBtn}
              onClick={() => setCarrinhoAberto((v) => !v)}
            >
              🛒{" "}
              {totalItens > 0 && <span style={styles.badge}>{totalItens}</span>}
            </button>
          )}
        </div>
      </nav>

      {/* ─── VISÃO 1: LOJA DO CLIENTE ─── */}
      {view === "loja" && (
        <>
          <header style={styles.hero}>
            <div style={styles.heroInner}>
              <p style={styles.heroTag}>✨ Saudável, prático e delicioso</p>
              <h1 style={styles.heroTitle}>
                Marmitas fit <br />
                <span style={styles.heroAccent}>prontas pra você</span>
              </h1>
              <p style={styles.heroDesc}>
                Refeições congeladas preparadas com carinho e ingredientes
                frescos. Descongela, aquece e está pronto! 🥦
              </p>
              <a href="#cardapio" style={styles.heroBtn}>
                Ver cardápio →
              </a>
            </div>
            <div style={styles.heroDeco}>
              <div style={styles.decoCircle1} />
              <div style={styles.decoCircle2} />
              <div style={styles.decoEmojis}>
                {["🥦", "🍗", "🥕", "🫙", "🥗", "🍳"].map((e, i) => (
                  <span
                    key={i}
                    style={{
                      ...styles.floatEmoji,
                      animationDelay: `${i * 0.4}s`,
                      top: `${10 + (i % 3) * 28}%`,
                      left: `${5 + (i % 2) * 50}%`,
                    }}
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>
          </header>

          <section style={styles.bens}>
            {[
              {
                ico: "❄️",
                title: "Congelado na hora",
                desc: "Mantém todos os nutrientes e sabor",
              },
              {
                ico: "⚡",
                title: "Pronto em minutos",
                desc: "Só aquecer e servir",
              },
              {
                ico: "💪",
                title: "Balanceado",
                desc: "Macros calculados por prato",
              },
              {
                ico: "🚚",
                title: "Entrega semanal",
                desc: "Receba em casa toda semana",
              },
            ].map((b, i) => (
              <div key={i} style={styles.benCard}>
                <span style={styles.benIco}>{b.ico}</span>
                <strong style={styles.benTitle}>{b.title}</strong>
                <p style={styles.benDesc}>{b.desc}</p>
              </div>
            ))}
          </section>

          <section id="cardapio" style={styles.menu}>
            <div style={styles.menuHeader}>
              <h2 style={styles.menuTitle}>Cardápio da semana</h2>
              <p style={styles.menuSub}>Escolha o tamanho ideal para você</p>
            </div>
            {menu.length === 0 ? (
              <div style={{ textAlign: "center", color: C.muted, padding: 40 }}>
                <p>Carregando as delícias da GiuFit... 🍱</p>
              </div>
            ) : (
              <div style={styles.grid}>
                {menu
                  .filter((p) => p.ativo)
                  .map((prato) => {
                    const tamSel =
                      selecionados[prato.id] || prato.tamanhos[0]?.tamanho;
                    const precoSel = prato.tamanhos.find(
                      (t) => t.tamanho === tamSel,
                    )?.preco;
                    return (
                      <div key={prato.id} style={styles.card}>
                        <div style={styles.cardEmoji}>{prato.emoji}</div>
                        <div style={styles.cardBody}>
                          <h3 style={styles.cardName}>{prato.nome}</h3>
                          <p style={styles.cardDesc}>{prato.descricao}</p>
                          <div style={styles.tamRow}>
                            {prato.tamanhos.map((t) => (
                              <button
                                key={t.tamanho}
                                style={{
                                  ...styles.tamBtn,
                                  ...(tamSel === t.tamanho
                                    ? styles.tamBtnActive
                                    : {}),
                                }}
                                onClick={() => setSel(prato.id, t.tamanho)}
                              >
                                {t.tamanho}
                              </button>
                            ))}
                          </div>
                          <div style={styles.cardFooter}>
                            <span style={styles.preco}>
                              {fmt(precoSel || 0)}
                            </span>
                            <button
                              style={styles.addBtn}
                              onClick={() => adicionarAoCarrinho(prato)}
                            >
                              + Adicionar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </section>
        </>
      )}

      {/* ─── VISÃO 2: PAINEL ADMIN (Chamando componente isolado) ─── */}
      {view === "admin" && (
        <section
          style={{
            ...styles.menu,
            paddingTop: 120,
            minHeight: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AdminPanel
            menu={menu}
            carregarMenu={carregarMenu}
            setView={setView}
          />
        </section>
      )}

      {/* ─── FOOTER ─── */}
      <footer style={styles.footer}>
        <span style={styles.footerLogo}>GiuFit 🍽️</span>
        <p style={styles.footerSub}>Marmitas congeladas com amor ❤️</p>
        <p style={styles.footerCopy}>
          © 2026 GiuFit — Todos os direitos reservados
        </p>
      </footer>

      {/* ─── COMPONENTE ISOLADO DO CARRINHO ─── */}
      <CartSidebar
        carrinho={carrinho}
        carrinhoAberto={carrinhoAberto}
        setCarrinhoAberto={setCarrinhoAberto}
        altQtd={altQtd}
        total={total}
        finalizarPedido={finalizarPedido}
      />

      {pedidoFeito && <div style={styles.toast}>✅ Pedido enviado!</div>}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Nunito:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Nunito', sans-serif; background: #FFFCF6; }
        @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-14px) rotate(8deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
