import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { API_URL, moeda, normalizarTamanhos, urlDaFoto } from "./api";
import CartSidebar from "./CartSidebar";
import {
  DEPOIMENTOS,
  DESTAQUES,
  DIFERENCIAIS,
  MARCA,
  PASSOS,
  PERGUNTAS,
} from "./conteudo";
import {
  IconChat,
  IconCarrinho,
  IconEstrela,
  IconFolha,
  IconGelo,
  IconInstagram,
  IconMais,
  IconMenu,
  IconFechar,
  IconMicro,
  IconPin,
  IconZap,
  IconSeta,
  PratoIlustrado,
} from "./components/Icons";

const ICONES = { folha: IconFolha, gelo: IconGelo, micro: IconMicro, zap: IconZap };
const CHAVE_CARRINHO = "giufit:carrinho:v2";

const linkWhats = (texto) =>
  `https://wa.me/${MARCA.whatsappNumero}?text=${encodeURIComponent(texto)}`;

// localStorage pode estar bloqueado (aba anônima etc.): nunca deixa quebrar o site.
const lerCarrinho = () => {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_CARRINHO) || "[]");
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
};

export default function Loja({ irParaAdmin }) {
  const [pratos, setPratos] = useState([]);
  const [status, setStatus] = useState("carregando"); // carregando | ok | erro
  const [demorando, setDemorando] = useState(false);
  const [carrinho, setCarrinho] = useState(lerCarrinho);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [rolou, setRolou] = useState(false);
  const [aviso, setAviso] = useState("");

  const timerAviso = useRef(null);
  const mostrarAviso = useCallback((texto) => {
    setAviso(texto);
    window.clearTimeout(timerAviso.current);
    timerAviso.current = window.setTimeout(() => setAviso(""), 2600);
  }, []);

  // ── Cardápio ──────────────────────────────────────────
  // Busca o cardápio e, já com os dados novos, confere o carrinho salvo
  // (preço mudou ou prato saiu do cardápio).
  const buscar = useCallback(() => {
    // O servidor gratuito "dorme" e pode levar alguns segundos para acordar.
    const t = window.setTimeout(() => setDemorando(true), 4000);
    fetch(`${API_URL}/pratos`)
      .then((res) => {
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Resposta inesperada");
        const lista = data.map((p) => ({
          id: p.id,
          nome: p.nome || "Sem nome",
          descricao: p.descricao || "",
          foto: urlDaFoto(p),
          tamanhos: normalizarTamanhos(p).filter((t) => t.preco > 0),
        }));
        setPratos(lista);
        setCarrinho((atual) =>
          atual
            .map((item) => {
              const prato = lista.find((p) => p.id === item.id);
              const tam = prato?.tamanhos.find((x) => x.tamanho === item.tamanho);
              return prato && tam ? { ...item, nome: prato.nome, preco: tam.preco, foto: prato.foto } : null;
            })
            .filter(Boolean),
        );
        setStatus("ok");
      })
      .catch((err) => {
        console.error("Erro ao carregar o cardápio:", err);
        setStatus("erro");
      })
      .finally(() => window.clearTimeout(t));
  }, []);

  const tentarDeNovo = () => {
    setStatus("carregando");
    setDemorando(false);
    buscar();
  };

  useEffect(() => {
    buscar();
  }, [buscar]);

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
    } catch {
      /* sem armazenamento: o carrinho só vale nesta visita */
    }
  }, [carrinho]);

  // ── Interface ─────────────────────────────────────────
  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 10);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  useEffect(() => {
    document.body.style.overflow = carrinhoAberto ? "hidden" : "";
    const aoTeclar = (e) => {
      if (e.key === "Escape") {
        setCarrinhoAberto(false);
        setMenuAberto(false);
      }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", aoTeclar);
    };
  }, [carrinhoAberto]);

  // ── Carrinho ──────────────────────────────────────────
  const adicionar = (prato, tamanho) => {
    const chave = `${prato.id}-${tamanho.tamanho}`;
    setCarrinho((atual) => {
      const existe = atual.find((i) => i.chave === chave);
      if (existe) return atual.map((i) => (i.chave === chave ? { ...i, qtd: Math.min(i.qtd + 1, 99) } : i));
      return [
        ...atual,
        { chave, id: prato.id, nome: prato.nome, foto: prato.foto, tamanho: tamanho.tamanho, preco: tamanho.preco, qtd: 1 },
      ];
    });
    mostrarAviso(`${prato.nome} (${tamanho.tamanho}) adicionado`);
  };

  const alterarQtd = (chave, delta) =>
    setCarrinho((atual) =>
      atual
        .map((i) => (i.chave === chave ? { ...i, qtd: Math.min(i.qtd + delta, 99) } : i))
        .filter((i) => i.qtd > 0),
    );

  const total = carrinho.reduce((s, i) => s + i.preco * i.qtd, 0);
  const totalItens = carrinho.reduce((s, i) => s + i.qtd, 0);

  const finalizarPedido = () => {
    if (carrinho.length === 0) return;
    const linhas = carrinho.map((i) => `• ${i.qtd}x ${i.nome} (${i.tamanho}) — ${moeda(i.preco * i.qtd)}`);
    const texto = `Olá GiuFit! Gostaria de fazer um pedido:\n\n${linhas.join("\n")}\n\n*Total: ${moeda(total)}*`;
    window.open(linkWhats(texto), "_blank", "noopener,noreferrer");
    setCarrinhoAberto(false);
    setCarrinho([]);
    mostrarAviso("Pedido aberto no WhatsApp. É só enviar a mensagem!");
  };

  const fotosHero = useMemo(() => pratos.filter((p) => p.foto).slice(0, 3), [pratos]);
  const fecharMenu = () => setMenuAberto(false);

  return (
    <>
      <a href="#cardapio" className="sr-only">
        Ir para o cardápio
      </a>

      {/* ───── Cabeçalho ───── */}
      <header className={`topo ${rolou || menuAberto ? "rolou" : ""}`}>
        <div className="container topo-inner">
          <a href="#inicio" className="marca" aria-label="GiuFit, página inicial" onClick={fecharMenu}>
            <img src="/logo-mark.webp" alt="" width="48" height="43" />
            <span className="marca-texto">
              {MARCA.nome}
              <small>Marmitas congeladas</small>
            </span>
          </a>

          <nav id="menu-principal" className={`nav ${menuAberto ? "aberto" : ""}`} aria-label="Principal">
            <a href="#cardapio" onClick={fecharMenu}>Cardápio</a>
            <a href="#como-funciona" onClick={fecharMenu}>Como funciona</a>
            <a href="#perguntas" onClick={fecharMenu}>Perguntas</a>
            <a href="#contato" onClick={fecharMenu}>Contato</a>
          </nav>

          <div className="topo-acoes">
            <button
              type="button"
              className="btn-carrinho"
              onClick={() => setCarrinhoAberto(true)}
              aria-label={`Abrir carrinho, ${totalItens} ${totalItens === 1 ? "item" : "itens"}`}
            >
              <IconCarrinho />
              <span className="rotulo">Carrinho</span>
              {totalItens > 0 && <span className="badge">{totalItens}</span>}
            </button>
            <button
              type="button"
              className="btn-menu"
              onClick={() => setMenuAberto((v) => !v)}
              aria-expanded={menuAberto}
              aria-controls="menu-principal"
              aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            >
              {menuAberto ? <IconFechar /> : <IconMenu />}
            </button>
          </div>
        </div>
      </header>

      <main id="inicio">
        {/* ───── Hero ───── */}
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <span className="pill">
                <IconFolha size={16} /> Saudável não precisa ser sem graça
              </span>
              <h1>
                Marmitas fit
                <em>que você vai amar</em>
              </h1>
              <p className="hero-texto">
                Refeições congeladas preparadas com carinho, ingredientes frescos e muito sabor.
                Descongela, aquece e está pronto.
              </p>
              <div className="hero-botoes">
                <a href="#cardapio" className="btn btn-primary">
                  Ver cardápio <IconSeta size={18} />
                </a>
                <a href="#como-funciona" className="btn btn-ghost">
                  Como funciona
                </a>
              </div>
              <div className="hero-numeros">
                {DESTAQUES.map((d) => (
                  <div key={d.rotulo}>
                    <strong>{d.numero}</strong>
                    <span>{d.rotulo}</span>
                  </div>
                ))}
                {status === "ok" && pratos.length > 0 && (
                  <div>
                    <strong>{pratos.length}</strong>
                    <span>{pratos.length === 1 ? "opção no cardápio" : "opções no cardápio"}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-arco">
                {fotosHero.length >= 3 ? (
                  <div className="hero-colagem">
                    {fotosHero.map((p) => (
                      <img key={p.id} src={p.foto} alt={p.nome} decoding="async" />
                    ))}
                  </div>
                ) : fotosHero.length > 0 ? (
                  <div className="hero-colagem um">
                    <img src={fotosHero[0].foto} alt={fotosHero[0].nome} decoding="async" />
                  </div>
                ) : (
                  <PratoIlustrado />
                )}
              </div>
              <div className="hero-selo">
                <span className="ico">
                  <IconPin size={22} />
                </span>
                <span>
                  <b>Entregamos em</b>
                  {MARCA.regiao}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ───── Diferenciais ───── */}
        <div className="faixa">
          <div className="container">
            <div className="faixa-grid">
              {DIFERENCIAIS.map((d) => {
                const Icone = ICONES[d.icone] || IconFolha;
                return (
                  <div className="faixa-item" key={d.titulo}>
                    <span className="ico">
                      <Icone size={22} />
                    </span>
                    <div>
                      <h3>{d.titulo}</h3>
                      <p>{d.texto}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ───── Cardápio ───── */}
        <section id="cardapio" className="secao">
          <div className="container">
            <div className="secao-cab">
              <span className="etiqueta">Cardápio semanal</span>
              <h2>Escolha sua marmita</h2>
              <p>Preparadas com ingredientes frescos. Escolha o tamanho e adicione ao carrinho.</p>
            </div>

            <div className="cardapio" aria-busy={status === "carregando"}>
              {status === "carregando" && (
                <>
                  <div className="esqueleto" />
                  <div className="esqueleto" />
                  <div className="esqueleto" />
                  {demorando && (
                    <p className="estado" role="status">
                      Estamos preparando o cardápio. Pode levar alguns segundos na primeira visita.
                    </p>
                  )}
                </>
              )}

              {status === "erro" && (
                <div className="estado" role="alert">
                  <p>Não conseguimos carregar o cardápio agora.</p>
                  <p style={{ marginTop: 14 }}>
                    <button type="button" className="btn btn-primary" onClick={tentarDeNovo}>
                      Tentar de novo
                    </button>
                  </p>
                </div>
              )}

              {status === "ok" && pratos.length === 0 && (
                <div className="estado">
                  <p>O cardápio desta semana ainda está sendo preparado.</p>
                  <p style={{ marginTop: 14 }}>
                    <a className="btn btn-whats" href={linkWhats(MARCA.whatsappTexto)} target="_blank" rel="noopener noreferrer">
                      <IconChat size={18} /> Falar no WhatsApp
                    </a>
                  </p>
                </div>
              )}

              {status === "ok" &&
                pratos.map((prato, i) => (
                  <PratoCard key={prato.id} prato={prato} atraso={i} onAdicionar={adicionar} />
                ))}
            </div>
          </div>
        </section>

        {/* ───── Como funciona ───── */}
        <section id="como-funciona" className="secao alt">
          <div className="container">
            <div className="secao-cab">
              <span className="etiqueta">Simples assim</span>
              <h2>Como funciona</h2>
            </div>
            <ol className="passos" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {PASSOS.map((p) => (
                <li className="passo" key={p.titulo}>
                  <h3>{p.titulo}</h3>
                  <p>{p.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ───── Depoimentos ───── */}
        {DEPOIMENTOS.length > 0 && (
          <section className="secao">
            <div className="container">
              <div className="secao-cab">
                <span className="etiqueta">Quem já provou</span>
                <h2>O que dizem nossas clientes</h2>
              </div>
              <div className="depoimentos">
                {DEPOIMENTOS.map((d) => (
                  <figure className="depoimento" key={d.nome} style={{ margin: 0 }}>
                    <div className="estrelas" role="img" aria-label="5 de 5 estrelas">
                      {[0, 1, 2, 3, 4].map((n) => (
                        <IconEstrela key={n} size={18} />
                      ))}
                    </div>
                    <blockquote>“{d.texto}”</blockquote>
                    <footer>
                      <span className="avatar" aria-hidden="true">
                        {d.nome.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                      </span>
                      <strong>{d.nome}</strong>
                    </footer>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ───── Perguntas frequentes ───── */}
        <section id="perguntas" className="secao alt">
          <div className="container">
            <div className="secao-cab">
              <span className="etiqueta">Tire suas dúvidas</span>
              <h2>Perguntas frequentes</h2>
            </div>
            <div className="faq">
              {PERGUNTAS.map((q) => (
                <details key={q.p}>
                  <summary>{q.p}</summary>
                  <p>{q.r}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ───── Chamada final ───── */}
        <section className="cta secao" style={{ paddingBottom: 92 }}>
          <div className="container">
            <div className="cta-caixa">
              <h2>Pronta para começar?</h2>
              <p>Monte seu pedido e receba marmitas fresquinhas, prontas para a sua semana.</p>
              <div className="cta-botoes">
                <a href="#cardapio" className="btn btn-light">
                  Montar meu pedido <IconSeta size={18} />
                </a>
                <a className="btn btn-ghost" href={linkWhats(MARCA.whatsappTexto)} target="_blank" rel="noopener noreferrer">
                  <IconChat size={18} /> Tirar dúvidas no WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ───── Rodapé ───── */}
      <footer className="rodape" id="contato">
        <div className="container">
          <div className="rodape-grid">
            <div>
              <img className="logo" src="/logo.webp" alt="GiuFit Marmitas Congeladas" width="150" height="158" loading="lazy" />
              <p>Alimentação saudável, prática e saborosa, feita com carinho para a sua rotina.</p>
            </div>
            <div>
              <h4>Navegue</h4>
              <ul>
                <li><a href="#cardapio">Cardápio</a></li>
                <li><a href="#como-funciona">Como funciona</a></li>
                <li><a href="#perguntas">Perguntas frequentes</a></li>
              </ul>
            </div>
            <div>
              <h4>Contato</h4>
              <ul>
                <li>
                  <a href={linkWhats(MARCA.whatsappTexto)} target="_blank" rel="noopener noreferrer">
                    <IconChat size={18} /> WhatsApp
                  </a>
                </li>
                <li>
                  <a href={MARCA.instagramUrl} target="_blank" rel="noopener noreferrer">
                    <IconInstagram size={18} /> {MARCA.instagramUsuario}
                  </a>
                </li>
                <li>
                  <span style={{ display: "inline-flex", gap: 9, alignItems: "center" }}>
                    <IconPin size={18} /> {MARCA.regiao}
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="rodape-fim">
            <span>© {new Date().getFullYear()} GiuFit · Todos os direitos reservados</span>
            <button type="button" className="link-discreto" onClick={irParaAdmin}>
              Área restrita
            </button>
          </div>
        </div>
      </footer>

      {/* Barra fixa no celular */}
      <button
        type="button"
        className={`barra-carrinho ${totalItens > 0 && !carrinhoAberto ? "visivel" : ""}`}
        onClick={() => setCarrinhoAberto(true)}
        aria-label="Ver meu pedido"
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <IconCarrinho /> Ver meu pedido ({totalItens})
        </span>
        <strong>{moeda(total)}</strong>
      </button>

      <CartSidebar
        aberto={carrinhoAberto}
        fechar={() => setCarrinhoAberto(false)}
        carrinho={carrinho}
        alterarQtd={alterarQtd}
        total={total}
        finalizarPedido={finalizarPedido}
      />

      <div role="status" aria-live="polite" className="sr-only">{aviso}</div>
      {aviso && !carrinhoAberto && <div className="aviso" aria-hidden="true">{aviso}</div>}
    </>
  );
}

function PratoCard({ prato, atraso, onAdicionar }) {
  const [escolhido, setEscolhido] = useState(prato.tamanhos[0]?.tamanho);
  const atual = prato.tamanhos.find((t) => t.tamanho === escolhido) || prato.tamanhos[0];

  return (
    <article className="prato" style={{ animationDelay: `${Math.min(atraso, 8) * 0.06}s` }}>
      <div className="prato-foto">
        {prato.foto ? (
          <img src={prato.foto} alt={prato.nome} loading="lazy" decoding="async" />
        ) : (
          <div className="sem-foto">
            <PratoIlustrado />
          </div>
        )}
      </div>
      <div className="prato-corpo">
        <h3>{prato.nome}</h3>
        {prato.descricao && <p className="prato-desc">{prato.descricao}</p>}

        {atual ? (
          <>
            {prato.tamanhos.length > 1 && (
              <div className="tamanhos" role="group" aria-label={`Tamanho de ${prato.nome}`}>
                {prato.tamanhos.map((t) => (
                  <button
                    key={t.tamanho}
                    type="button"
                    aria-pressed={atual.tamanho === t.tamanho}
                    onClick={() => setEscolhido(t.tamanho)}
                  >
                    {t.tamanho}
                  </button>
                ))}
              </div>
            )}
            <div className="prato-rodape">
              <div className="preco">
                <small>{atual.tamanho}</small>
                <strong>{moeda(atual.preco)}</strong>
              </div>
              <button
                type="button"
                className="btn-add"
                onClick={() => onAdicionar(prato, atual)}
                aria-label={`Adicionar ${prato.nome} ${atual.tamanho} ao carrinho`}
              >
                <IconMais size={18} /> Adicionar
              </button>
            </div>
          </>
        ) : (
          <div className="prato-rodape">
            <span className="preco">
              <small>Consulte o valor pelo WhatsApp</small>
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
