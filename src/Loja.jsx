import { useState, useEffect, useRef } from "react";

// Função blindada: Se o banco mandar algo errado, ele transforma em R$ 0,00 e não trava a tela
const fmt = (v) => {
  const num = Number(v);
  return (isNaN(num) ? 0 : num).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

export default function Loja({ irParaAdmin }) {
  const [carrinho, setCarrinho] = useState([]);
  const [selecionados, setSelecionados] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filtro, setFiltro] = useState("Todas");
  const [toast, setToast] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const heroRef = useRef(null);

  const [menuData, setMenuData] = useState([]);
  const [categorias, setCategorias] = useState(["Todas"]);

  useEffect(() => {
    setHeroVisible(true);
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);

    fetch("https://giufit-backend.onrender.com/pratos")
      .then((res) => res.json())
      .then((data) => {
        // Imprime os dados no console para sabermos o que está a chegar
        console.log("Dados que chegaram do banco:", data);

        // Se a API por algum motivo não devolver uma lista, paramos aqui para não quebrar
        if (!Array.isArray(data)) return;

        const pratosDoBanco = data.map((prato) => ({
          id: prato.id,
          nome: prato.nome || "Sem Nome",
          descricao: prato.descricao || "Sem descrição",
          emoji: "🍱",
          cal: 350,
          prot: 30,
          categoria: "Pratos",
          tamanhos: [
            // Se o banco não enviar o preço correto, colocamos um valor padrão provisório para não travar
            { tamanho: "250g", preco: Number(prato.preco_250g) || 15 },
            { tamanho: "350g", preco: Number(prato.preco_350g) || 20 },
            { tamanho: "500g", preco: Number(prato.preco_500g) || 25 },
          ],
        }));

        setMenuData(pratosDoBanco);
        setCategorias(["Todas", "Pratos"]);
      })
      .catch((err) => console.error("Erro ao carregar do Render:", err));

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const tamAtual = (id) =>
    selecionados[id] || menuData.find((p) => p.id === id)?.tamanhos[0]?.tamanho;

  const addCarrinho = (prato) => {
    const tam = tamAtual(prato.id);
    const info = prato.tamanhos.find((t) => t.tamanho === tam);
    const chave = `${prato.id}-${tam}`;
    setCarrinho((c) => {
      const ex = c.find((i) => i.chave === chave);
      return ex
        ? c.map((i) => (i.chave === chave ? { ...i, qtd: i.qtd + 1 } : i))
        : [
            ...c,
            {
              chave,
              id: prato.id,
              nome: prato.nome,
              emoji: prato.emoji,
              tamanho: tam,
              preco: info.preco,
              qtd: 1,
            },
          ];
    });
    showToast(`${prato.nome} adicionado! 🛒`);
  };

  const altQtd = (chave, d) =>
    setCarrinho((c) =>
      c
        .map((i) => (i.chave === chave ? { ...i, qtd: i.qtd + d } : i))
        .filter((i) => i.qtd > 0),
    );

  const total = carrinho.reduce((s, i) => s + i.preco * i.qtd, 0);
  const totalItens = carrinho.reduce((s, i) => s + i.qtd, 0);

  const filtrados =
    filtro === "Todas"
      ? menuData
      : menuData.filter((p) => p.categoria === filtro);

  const finalizarPedido = () => {
    const linhas = carrinho
      .map(
        (i) => `• ${i.qtd}x ${i.nome} (${i.tamanho}) — ${fmt(i.preco * i.qtd)}`,
      )
      .join("%0A");
    const msg = `Olá GiuFit! Gostaria de fazer um pedido:%0A%0A${linhas}%0A%0A*Total: ${fmt(total)}*`;

    // ALTERE AQUI:
    window.open(`https://wa.me/5511976373639?text=${msg}`, "_blank");

    setSidebarOpen(false);
    setCarrinho([]);
    showToast("Pedido enviado pelo WhatsApp! ✅");
  };

  return (
    <div style={S.root}>
      {/* NAV */}
      <nav style={{ ...S.nav, ...(scrolled ? S.navScrolled : {}) }}>
        <div style={S.navBrand}>
          <img
            src="/giufitlogoo.png"
            alt="Logo GiuFit"
            style={{ height: "70px", width: "auto", objectFit: "contain" }}
          />
        </div>
        <div style={S.navLinks}>
          {["Cardápio", "Como funciona", "Contato"].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(" ", "-")}`}
              style={S.navLink}
            >
              {l}
            </a>
          ))}
        </div>
        <button style={S.cartTrigger} onClick={() => setSidebarOpen(true)}>
          <span style={S.cartIcon}>🛒</span>
          <span style={S.cartLabel}>Carrinho</span>
          {totalItens > 0 && <span style={S.cartBadge}>{totalItens}</span>}
        </button>
      </nav>

      {/* HERO */}
      <section style={S.hero} ref={heroRef}>
        <div style={S.heroBg} />
        <div
          style={{
            ...S.heroContent,
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "none" : "translateY(40px)",
            transition: "all 0.9s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <div style={S.heroPill}>✨ Saudável não precisa ser sem graça</div>
          <h1 style={S.heroH1}>
            Marmitas fit
            <br />
            <span style={S.heroAccent}>que você vai amar</span>
          </h1>
          <p style={S.heroP}>
            Refeições congeladas preparadas com carinho, ingredientes frescos e
            muito sabor. Descongela, aquece e está pronto!
          </p>
          <div style={S.heroCtas}>
            <a href="#cardápio" style={S.btnPrimary}>
              Ver cardápio →
            </a>
            <a href="#como-funciona" style={S.btnGhost}>
              Como funciona
            </a>
          </div>
          <div style={S.heroStats}>
            {[
              ["500+", "clientes felizes"],
              ["6", "opções semanais"],
              ["100%", "natural"],
            ].map(([n, l]) => (
              <div key={l} style={S.heroStat}>
                <span style={S.heroStatNum}>{n}</span>
                <span style={S.heroStatLabel}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            ...S.heroVisual,
            opacity: heroVisible ? 1 : 0,
            transition: "all 1.2s cubic-bezier(0.16,1,0.3,1) 0.2s",
          }}
        >
          {[
            { e: "🥦", x: "10%", y: "15%", delay: "0s", size: 52 },
            { e: "🍗", x: "72%", y: "8%", delay: "0.3s", size: 64 },
            { e: "🥕", x: "55%", y: "60%", delay: "0.6s", size: 44 },
            { e: "🥑", x: "5%", y: "68%", delay: "0.9s", size: 56 },
            { e: "🌿", x: "80%", y: "75%", delay: "1.2s", size: 48 },
            { e: "🍠", x: "38%", y: "20%", delay: "1.5s", size: 58 },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: item.x,
                top: item.y,
                fontSize: item.size,
                animation: `floatFly 4s ease-in-out ${item.delay} infinite`,
                filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.15))",
              }}
            >
              {item.e}
            </div>
          ))}
          <div style={S.heroBlobMain} />
          <div style={S.heroBlobSecond} />
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" style={S.section}>
        <div style={S.sectionInner}>
          <div style={S.sectionHead}>
            <span style={S.sectionTag}>Simples assim</span>
            <h2 style={S.sectionTitle}>Como funciona</h2>
          </div>
          <div style={S.stepsGrid}>
            {[
              {
                n: "01",
                ico: "📋",
                title: "Escolha suas marmitas",
                desc: "Navegue pelo cardápio da semana e monte seu pedido com os sabores que preferir.",
              },
              {
                n: "02",
                ico: "💬",
                title: "Peça pelo WhatsApp",
                desc: "Envie seu pedido direto pelo WhatsApp. Confirmamos em minutos!",
              },
              {
                n: "03",
                ico: "❄️",
                title: "Receba congelado",
                desc: "Entregamos tudo congelado e lacrado, mantendo sabor e nutrientes intactos.",
              },
              {
                n: "04",
                ico: "🍽️",
                title: "Aqueça e aproveite",
                desc: "Micro-ondas ou banho-maria por alguns minutos. Pronto! Refeição feita.",
              },
            ].map((step, i) => (
              <div key={i} style={S.stepCard}>
                <div style={S.stepNum}>{step.n}</div>
                <div style={S.stepIco}>{step.ico}</div>
                <h3 style={S.stepTitle}>{step.title}</h3>
                <p style={S.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CARDÁPIO */}
      <section id="cardápio" style={{ ...S.section, background: "#F7F3EC" }}>
        <div style={S.sectionInner}>
          <div style={S.sectionHead}>
            <span style={S.sectionTag}>Cardápio semanal</span>
            <h2 style={S.sectionTitle}>Escolha sua marmita</h2>
            <p style={S.sectionSub}>
              Todas preparadas com ingredientes frescos e sem conservantes
            </p>
          </div>

          {/* FILTROS */}
          <div style={S.filtros}>
            {categorias.map((cat) => (
              <button
                key={cat}
                style={{
                  ...S.filtroBtn,
                  ...(filtro === cat ? S.filtroBtnActive : {}),
                }}
                onClick={() => setFiltro(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* GRID */}
          <div style={S.menuGrid}>
            {filtrados.map((prato, i) => {
              const tam = tamAtual(prato.id);
              const preco = prato.tamanhos.find(
                (t) => t.tamanho === tam,
              )?.preco;
              return (
                <div
                  key={prato.id}
                  style={{ ...S.pratoCard, animationDelay: `${i * 0.07}s` }}
                >
                  <div style={S.pratoEmojiWrap}>
                    <span style={S.pratoEmoji}>{prato.emoji}</span>
                    <span style={S.pratoCatBadge}>{prato.categoria}</span>
                  </div>
                  <div style={S.pratoBody}>
                    <h3 style={S.pratoNome}>{prato.nome}</h3>
                    <p style={S.pratoDesc}>{prato.descricao}</p>
                    <div style={S.pratoMacros}>
                      <span style={S.macro}>🔥 {prato.cal} kcal</span>
                      <span style={S.macro}>💪 {prato.prot}g prot.</span>
                    </div>
                    <div style={S.tamRow}>
                      {prato.tamanhos.map((t) => (
                        <button
                          key={t.tamanho}
                          style={{
                            ...S.tamBtn,
                            ...(tam === t.tamanho ? S.tamBtnOn : {}),
                          }}
                          onClick={() =>
                            setSelecionados((s) => ({
                              ...s,
                              [prato.id]: t.tamanho,
                            }))
                          }
                        >
                          {t.tamanho}
                        </button>
                      ))}
                    </div>
                    <div style={S.pratoFooter}>
                      <div>
                        <div style={S.precoLabel}>a partir de</div>
                        <div style={S.preco}>{fmt(preco)}</div>
                      </div>
                      <button
                        style={S.addBtn}
                        onClick={() => addCarrinho(prato)}
                      >
                        + Adicionar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section style={S.section}>
        <div style={S.sectionInner}>
          <div style={S.sectionHead}>
            <span style={S.sectionTag}>Quem já provou</span>
            <h2 style={S.sectionTitle}>O que dizem nossas clientes</h2>
          </div>
          <div style={S.depGrid}>
            {[
              {
                nome: "Camila S.",
                texto:
                  "Minha semana ficou muito mais fácil! As marmitas são deliciosas e me ajudaram a manter a dieta.",
                nota: "⭐⭐⭐⭐⭐",
                ini: "CS",
              },
              {
                nome: "Fernanda L.",
                texto:
                  "Amo a praticidade! Congelo tudo na segunda e fico a semana toda tranquila. O strogonoff é incrível!",
                nota: "⭐⭐⭐⭐⭐",
                ini: "FL",
              },
              {
                nome: "Aline M.",
                texto:
                  "Qualidade excepcional. Ingredientes frescos, porções generosas e o sabor é surpreendentemente bom!",
                nota: "⭐⭐⭐⭐⭐",
                ini: "AM",
              },
            ].map((d, i) => (
              <div key={i} style={S.depCard}>
                <div style={S.depNota}>{d.nota}</div>
                <p style={S.depTexto}>"{d.texto}"</p>
                <div style={S.depAuthor}>
                  <div style={S.depAvatar}>{d.ini}</div>
                  <strong style={S.depNome}>{d.nome}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={S.ctaSection}>
        <div style={S.ctaInner}>
          <h2 style={S.ctaTitle}>Pronta pra começar?</h2>
          <p style={S.ctaDesc}>
            Monte seu pedido agora e receba marmitas fresquinhas na sua porta 🥗
          </p>
          <a href="#cardápio" style={S.ctaBtn}>
            Montar meu pedido →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={S.footer}>
        <div style={S.footerInner}>
          <div style={S.footerBrand}>
            <img
              src="/giufitlogoo.png"
              alt="Logo GiuFit"
              style={{ height: "80px", width: "auto" }}
            />
            <p style={{ ...S.footerTagline, marginTop: "10px", color: "#aaa" }}>
              📍 Taboão da Serra e região
            </p>
            <p style={{ ...S.footerTagline, color: "#aaa" }}>
              🌱 Alimentação saudável, prática e saborosa
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <a href="#cardápio" style={S.footerLink}>
              Cardápio
            </a>
            <a href="#como-funciona" style={S.footerLink}>
              Como funciona
            </a>

            {/* Link com Ícone do WhatsApp */}
            <a
              href="https://wa.me/5511976373639"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/iconWhatsapp.png"
                alt="WhatsApp"
                style={{ height: "32px", width: "32px" }}
              />
            </a>

            {/* Link com Ícone do Instagram */}
            <a
              href="https://www.instagram.com/giufit.food/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/iconInstagram.png"
                alt="Instagram"
                style={{ height: "32px", width: "32px" }}
              />
            </a>

            <a
              onClick={irParaAdmin}
              style={{ ...S.footerLink, cursor: "pointer" }}
            >
              Área Restrita
            </a>
          </div>
        </div>
        <div style={S.footerBottom}>
          © 2026 GiuFit · Todos os direitos reservados
        </div>
      </footer>

      {/* SIDEBAR CARRINHO */}
      {sidebarOpen && (
        <div style={S.overlay} onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        style={{
          ...S.sidebar,
          transform: sidebarOpen ? "translateX(0)" : "translateX(110%)",
        }}
      >
        <div style={S.sbHead}>
          <h2 style={S.sbTitle}>Seu pedido</h2>
          <button style={S.sbClose} onClick={() => setSidebarOpen(false)}>
            ✕
          </button>
        </div>

        {carrinho.length === 0 ? (
          <div style={S.emptyCart}>
            <span style={{ fontSize: 56 }}>🍱</span>
            <p style={{ color: "#888", textAlign: "center", lineHeight: 1.6 }}>
              Seu carrinho está vazio.
              <br />
              Adicione marmitas ao seu pedido!
            </p>
          </div>
        ) : (
          <>
            <div style={S.sbItems}>
              {carrinho.map((item) => (
                <div key={item.chave} style={S.sbItem}>
                  <span style={S.sbItemEmoji}>{item.emoji}</span>
                  <div style={S.sbItemInfo}>
                    <div style={S.sbItemNome}>{item.nome}</div>
                    <div style={S.sbItemTam}>
                      {item.tamanho} · {fmt(item.preco)}
                    </div>
                  </div>
                  <div style={S.qtdCtrl}>
                    <button
                      style={S.qtdBtn}
                      onClick={() => altQtd(item.chave, -1)}
                    >
                      −
                    </button>
                    <span style={S.qtdNum}>{item.qtd}</span>
                    <button
                      style={S.qtdBtn}
                      onClick={() => altQtd(item.chave, 1)}
                    >
                      +
                    </button>
                  </div>
                  <span style={S.sbItemTotal}>
                    {fmt(item.preco * item.qtd)}
                  </span>
                </div>
              ))}
            </div>
            <div style={S.sbFooter}>
              <div style={S.sbSummary}>
                <div style={S.sbSummaryRow}>
                  <span style={{ color: "#888" }}>Subtotal</span>
                  <span>{fmt(total)}</span>
                </div>
                <div style={S.sbSummaryRow}>
                  <span style={{ color: "#888" }}>Entrega</span>
                  <span style={{ color: "#4a8c1c" }}>A combinar</span>
                </div>
                <div
                  style={{
                    ...S.sbSummaryRow,
                    borderTop: "1px solid #eee",
                    paddingTop: 12,
                    marginTop: 4,
                  }}
                >
                  <strong style={{ fontSize: 16 }}>Total</strong>
                  <strong style={{ fontSize: 22, color: "#4a8c1c" }}>
                    {fmt(total)}
                  </strong>
                </div>
              </div>
              <button style={S.whatsBtn} onClick={finalizarPedido}>
                <span>Pedir pelo WhatsApp</span>
                <span>💬</span>
              </button>
              <p
                style={{
                  fontSize: 11,
                  color: "#aaa",
                  textAlign: "center",
                  marginTop: 8,
                }}
              >
                Você será redirecionada para o WhatsApp
              </p>
            </div>
          </>
        )}
      </aside>

      {/* TOAST */}
      {toast && (
        <div
          style={{
            ...S.toast,
            background: toast.type === "success" ? "#4a8c1c" : "#e74c3c",
          }}
        >
          {toast.msg}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #FFFCF6; font-family: 'DM Sans', sans-serif; }
        a { text-decoration: none; }
        @keyframes floatFly {
          0%, 100% { transform: translateY(0) rotate(-4deg); }
          50% { transform: translateY(-18px) rotate(4deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .prato-card:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(0,0,0,0.12) !important; }
        .add-btn:hover { background: #3a7016 !important; transform: scale(1.03); }
        .filtro-btn:hover { background: #e8e0d0 !important; }
        .tam-btn:hover { border-color: #4a8c1c !important; }
        .nav-link:hover { color: #4a8c1c !important; }
        .cta-btn:hover { background: #3a7016 !important; transform: translateY(-2px); }
      `}</style>
    </div>
  );
}

const GREEN = "#4a8c1c";
const PINK = "#d4848a";
const CREAM = "#FFFCF6";
const CREAM2 = "#F7F3EC";

const S = {
  root: { minHeight: "100vh", background: CREAM, color: "#2d2d2d" },
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 48px",
    transition: "all 0.4s ease",
    gap: 24,
  },
  navScrolled: {
    background: "rgba(255,252,246,0.96)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 1px 32px rgba(0,0,0,0.08)",
    padding: "12px 48px",
  },
  navBrand: { display: "flex", alignItems: "center", gap: 10 },
  navLogoCircle: { fontSize: 28, lineHeight: 1 },
  navLogoName: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 22,
    fontWeight: 700,
    color: GREEN,
    lineHeight: 1.1,
  },
  navLogoSub: {
    fontSize: 10,
    color: PINK,
    fontWeight: 500,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  navLinks: { display: "flex", gap: 32, flex: 1, justifyContent: "center" },
  navLink: {
    fontSize: 14,
    fontWeight: 500,
    color: "#555",
    transition: "color 0.2s",
  },
  cartTrigger: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: GREEN,
    color: "#fff",
    border: "none",
    borderRadius: 50,
    padding: "10px 20px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    position: "relative",
    boxShadow: "0 4px 20px rgba(74,140,28,0.35)",
    transition: "all 0.2s",
  },
  cartIcon: { fontSize: 16 },
  cartLabel: {},
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    background: PINK,
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    borderRadius: "50%",
    width: 20,
    height: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    padding: "120px 48px 80px",
    position: "relative",
    overflow: "hidden",
    gap: 40,
  },
  heroBg: {
    position: "absolute",
    inset: 0,
    background: `radial-gradient(ellipse 70% 80% at 80% 50%, rgba(74,140,28,0.07) 0%, transparent 60%), radial-gradient(ellipse 50% 60% at 20% 80%, rgba(212,132,138,0.08) 0%, transparent 60%)`,
    pointerEvents: "none",
  },
  heroContent: { flex: "0 0 520px", maxWidth: 520, zIndex: 1 },
  heroPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(74,140,28,0.1)",
    color: GREEN,
    borderRadius: 50,
    padding: "6px 16px",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 24,
    border: "1px solid rgba(74,140,28,0.2)",
  },
  heroH1: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(44px, 6vw, 76px)",
    fontWeight: 700,
    lineHeight: 1.05,
    color: "#1a1a1a",
    marginBottom: 24,
  },
  heroAccent: { color: GREEN, fontStyle: "italic" },
  heroP: {
    fontSize: 17,
    color: "#666",
    lineHeight: 1.8,
    marginBottom: 36,
    maxWidth: 420,
  },
  heroCtas: { display: "flex", gap: 16, marginBottom: 56, flexWrap: "wrap" },
  btnPrimary: {
    background: GREEN,
    color: "#fff",
    borderRadius: 50,
    padding: "14px 32px",
    fontWeight: 600,
    fontSize: 15,
    boxShadow: "0 6px 28px rgba(74,140,28,0.4)",
    transition: "all 0.2s",
  },
  btnGhost: {
    background: "transparent",
    color: "#555",
    borderRadius: 50,
    padding: "14px 32px",
    fontWeight: 600,
    fontSize: 15,
    border: "1.5px solid #ddd",
    transition: "all 0.2s",
  },
  heroStats: { display: "flex", gap: 40 },
  heroStat: { display: "flex", flexDirection: "column" },
  heroStatNum: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 32,
    fontWeight: 700,
    color: GREEN,
    lineHeight: 1,
  },
  heroStatLabel: { fontSize: 12, color: "#888", fontWeight: 500, marginTop: 4 },
  heroVisual: { flex: 1, position: "relative", minHeight: 420 },
  heroBlobMain: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: "60% 40% 70% 30% / 50% 60% 40% 50%",
    background: "rgba(74,140,28,0.08)",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    animation: "floatFly 6s ease-in-out infinite",
  },
  heroBlobSecond: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: "40% 60% 30% 70% / 60% 40% 60% 40%",
    background: "rgba(212,132,138,0.08)",
    top: "30%",
    left: "55%",
    animation: "floatFly 8s ease-in-out 1s infinite",
  },
  section: { padding: "96px 48px" },
  sectionInner: { maxWidth: 1200, margin: "0 auto" },
  sectionHead: { textAlign: "center", marginBottom: 56 },
  sectionTag: {
    display: "inline-block",
    background: "rgba(74,140,28,0.1)",
    color: GREEN,
    borderRadius: 50,
    padding: "6px 16px",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 16,
    border: "1px solid rgba(74,140,28,0.15)",
  },
  sectionTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(28px, 4vw, 48px)",
    fontWeight: 700,
    color: "#1a1a1a",
    lineHeight: 1.2,
  },
  sectionSub: { fontSize: 16, color: "#888", marginTop: 12, lineHeight: 1.7 },
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 24,
  },
  stepCard: {
    background: "#fff",
    borderRadius: 24,
    padding: "36px 28px",
    border: "1px solid rgba(0,0,0,0.06)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  stepNum: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 48,
    fontWeight: 700,
    color: "rgba(74,140,28,0.15)",
    lineHeight: 1,
    marginBottom: 12,
  },
  stepIco: { fontSize: 32, marginBottom: 16 },
  stepTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 20,
    fontWeight: 700,
    color: "#1a1a1a",
    marginBottom: 10,
  },
  stepDesc: { fontSize: 14, color: "#777", lineHeight: 1.7 },
  filtros: {
    display: "flex",
    gap: 10,
    marginBottom: 40,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  filtroBtn: {
    background: "#fff",
    border: "1.5px solid #e0d8cc",
    borderRadius: 50,
    padding: "8px 20px",
    fontSize: 13,
    fontWeight: 600,
    color: "#666",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  filtroBtnActive: {
    background: GREEN,
    border: "1.5px solid " + GREEN,
    color: "#fff",
  },
  menuGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 28,
  },
  pratoCard: {
    background: "#fff",
    borderRadius: 28,
    overflow: "hidden",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    transition: "transform 0.3s, box-shadow 0.3s",
    animation: "fadeUp 0.5s ease both",
  },
  pratoEmojiWrap: {
    position: "relative",
    background: `linear-gradient(160deg, ${CREAM2} 0%, #ede8de 100%)`,
    padding: "40px 28px 28px",
    display: "flex",
    justifyContent: "center",
  },
  pratoEmoji: {
    fontSize: 80,
    filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.12))",
    lineHeight: 1,
  },
  pratoCatBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 50,
    padding: "4px 12px",
    fontSize: 11,
    fontWeight: 600,
    color: "#555",
  },
  pratoBody: { padding: "24px 28px 28px" },
  pratoNome: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 20,
    fontWeight: 700,
    color: "#1a1a1a",
    marginBottom: 10,
    lineHeight: 1.2,
  },
  pratoDesc: { fontSize: 13, color: "#888", lineHeight: 1.7, marginBottom: 16 },
  pratoMacros: { display: "flex", gap: 12, marginBottom: 20 },
  macro: {
    fontSize: 12,
    fontWeight: 600,
    color: "#666",
    background: CREAM2,
    borderRadius: 50,
    padding: "4px 12px",
  },
  tamRow: { display: "flex", gap: 8, marginBottom: 24 },
  tamBtn: {
    padding: "7px 16px",
    borderRadius: 50,
    border: "1.5px solid #e0d8cc",
    background: "transparent",
    color: "#666",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  tamBtnOn: {
    border: "1.5px solid " + GREEN,
    background: GREEN,
    color: "#fff",
  },
  pratoFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  precoLabel: {
    fontSize: 10,
    color: "#aaa",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  preco: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 26,
    fontWeight: 700,
    color: GREEN,
    lineHeight: 1,
  },
  addBtn: {
    background: GREEN,
    color: "#fff",
    border: "none",
    borderRadius: 50,
    padding: "12px 22px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(74,140,28,0.35)",
    transition: "all 0.2s",
  },
  depGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 24,
  },
  depCard: {
    background: "#fff",
    borderRadius: 24,
    padding: "32px 28px",
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
  },
  depNota: { fontSize: 18, marginBottom: 16 },
  depTexto: {
    fontSize: 15,
    color: "#555",
    lineHeight: 1.8,
    marginBottom: 24,
    fontStyle: "italic",
  },
  depAuthor: { display: "flex", alignItems: "center", gap: 12 },
  depAvatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "rgba(74,140,28,0.12)",
    color: GREEN,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
  },
  depNome: { fontSize: 14, color: "#333" },
  ctaSection: { background: GREEN, padding: "80px 48px", textAlign: "center" },
  ctaInner: { maxWidth: 600, margin: "0 auto" },
  ctaTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(32px, 5vw, 56px)",
    fontWeight: 700,
    color: "#fff",
    marginBottom: 16,
  },
  ctaDesc: {
    fontSize: 17,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 1.7,
    marginBottom: 36,
  },
  ctaBtn: {
    display: "inline-block",
    background: "#fff",
    color: GREEN,
    borderRadius: 50,
    padding: "16px 40px",
    fontWeight: 700,
    fontSize: 16,
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
    transition: "all 0.2s",
  },
  footer: { background: "#1a1a1a", color: "#fff", padding: "56px 48px 32px" },
  footerInner: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 32,
    marginBottom: 40,
  },
  footerBrand: {},
  footerLogo: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 24,
    fontWeight: 700,
    color: "#a8d47a",
    display: "block",
    marginBottom: 8,
  },
  footerTagline: { fontSize: 13, color: "#666" },
  footerLinks: { display: "flex", gap: 28, flexWrap: "wrap" },
  footerLink: { fontSize: 14, color: "#888", transition: "color 0.2s" },
  footerBottom: {
    maxWidth: 1200,
    margin: "0 auto",
    paddingTop: 24,
    borderTop: "1px solid #2a2a2a",
    fontSize: 12,
    color: "#444",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 2000,
    backdropFilter: "blur(4px)",
  },
  sidebar: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: 420,
    background: "#fff",
    zIndex: 2001,
    boxShadow: "-12px 0 60px rgba(0,0,0,0.15)",
    transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
    display: "flex",
    flexDirection: "column",
  },
  sbHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "24px 28px",
    borderBottom: "1px solid #f0ebe0",
  },
  sbTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 24,
    fontWeight: 700,
    color: "#1a1a1a",
  },
  sbClose: {
    background: "#f5f0e8",
    border: "none",
    borderRadius: "50%",
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: 14,
    color: "#555",
  },
  emptyCart: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    padding: 40,
  },
  sbItems: { flex: 1, overflowY: "auto", padding: "16px 28px" },
  sbItem: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "16px 0",
    borderBottom: "1px solid #f5f0e8",
  },
  sbItemEmoji: { fontSize: 32, flexShrink: 0 },
  sbItemInfo: { flex: 1 },
  sbItemNome: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1a1a1a",
    marginBottom: 3,
  },
  sbItemTam: { fontSize: 12, color: "#aaa" },
  qtdCtrl: { display: "flex", alignItems: "center", gap: 10 },
  qtdBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    border: "1.5px solid #e8e0d0",
    background: "transparent",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#555",
  },
  qtdNum: { fontSize: 15, fontWeight: 700, minWidth: 22, textAlign: "center" },
  sbItemTotal: { fontSize: 15, fontWeight: 700, color: GREEN, flexShrink: 0 },
  sbFooter: { padding: "20px 28px 28px", borderTop: "1px solid #f0ebe0" },
  sbSummary: {
    marginBottom: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  sbSummaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 14,
  },
  whatsBtn: {
    width: "100%",
    background: "#25D366",
    color: "#fff",
    border: "none",
    borderRadius: 16,
    padding: "18px",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    boxShadow: "0 6px 24px rgba(37,211,102,0.4)",
    transition: "all 0.2s",
  },
  toast: {
    position: "fixed",
    bottom: 32,
    left: "50%",
    transform: "translateX(-50%)",
    color: "#fff",
    padding: "14px 28px",
    borderRadius: 50,
    fontSize: 14,
    fontWeight: 600,
    boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
    zIndex: 9999,
    animation: "toastIn 0.4s ease both",
    whiteSpace: "nowrap",
  },
};
