import { useCallback, useEffect, useRef, useState } from "react";
import { API_URL, moeda, normalizarTamanhos, urlDaFoto } from "./api";
import { prepararFoto } from "./foto";
import {
  IconCadeado,
  IconCamera,
  IconLapis,
  IconLixeira,
  PratoIlustrado,
} from "./components/Icons";

const TAMANHOS = ["250g", "350g", "500g"];
const FORM_VAZIO = { nome: "", descricao: "", ativo: true, precos: { "250g": "", "350g": "", "500g": "" } };

export default function AdminPanel({ aoSair }) {
  const [token, setToken] = useState(""); // fica só na memória: some ao recarregar (de propósito)
  const [senha, setSenha] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [erroLogin, setErroLogin] = useState("");

  const [menu, setMenu] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [emEdicao, setEmEdicao] = useState(null); // id do prato sendo editado
  const [form, setForm] = useState(FORM_VAZIO);
  const [fotoNova, setFotoNova] = useState(null); // { blob, previa }
  const [fotoAtual, setFotoAtual] = useState(null); // url da foto já salva
  const [removerFoto, setRemoverFoto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null); // { tipo: "ok" | "erro", texto }
  const inputFoto = useRef(null);

  const autenticado = Boolean(token);
  const cabecalho = useCallback(
    (extra = {}) => ({ Authorization: `Bearer ${token}`, ...extra }),
    [token],
  );

  const sair = useCallback(() => {
    setToken("");
    setMenu([]);
  }, []);

  // 401 = senha inválida/alterada: volta para o login.
  const checar = useCallback(
    (res) => {
      if (res.status === 401) {
        sair();
        throw new Error("Sessão inválida. Entre novamente.");
      }
      if (!res.ok) {
        const e = new Error(`Erro ${res.status}`);
        e.status = res.status;
        throw e;
      }
      return res;
    },
    [sair],
  );

  const buscarMenu = useCallback(() => {
    return fetch(`${API_URL}/admin/pratos`, { headers: cabecalho() })
      .then(checar)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        setMenu(
          data.map((p) => ({
            id: p.id,
            nome: p.nome || "Sem nome",
            descricao: p.descricao || "",
            ativo: p.ativo !== false,
            foto: urlDaFoto(p),
            tamanhos: normalizarTamanhos(p),
          })),
        );
      })
      .catch((err) => setMensagem({ tipo: "erro", texto: err.message }))
      .finally(() => setCarregando(false));
  }, [cabecalho, checar]);

  const carregarMenu = useCallback(() => {
    setCarregando(true);
    return buscarMenu();
  }, [buscarMenu]);

  // Primeira carga logo depois do login (o "carregando" já foi ligado em entrar()).
  useEffect(() => {
    if (autenticado) buscarMenu();
  }, [autenticado, buscarMenu]);

  // ── Login (a senha é conferida pelo servidor) ───────────
  const entrar = (e) => {
    e.preventDefault();
    setEntrando(true);
    setErroLogin("");
    fetch(`${API_URL}/admin/login`, { method: "POST", headers: { Authorization: `Bearer ${senha}` } })
      .then((res) => {
        if (res.status === 429) setErroLogin("Muitas tentativas. Aguarde 1 minuto e tente de novo.");
        else if (res.ok) {
          setCarregando(true);
          setToken(senha);
        }
        else setErroLogin("Senha incorreta.");
      })
      .catch(() => setErroLogin("Não foi possível falar com o servidor. Tente novamente."))
      .finally(() => {
        setSenha("");
        setEntrando(false);
      });
  };

  // ── Formulário ──────────────────────────────────────────
  const limparFormulario = () => {
    setEmEdicao(null);
    setForm(FORM_VAZIO);
    setFotoNova((f) => {
      if (f?.previa) URL.revokeObjectURL(f.previa);
      return null;
    });
    setFotoAtual(null);
    setRemoverFoto(false);
    if (inputFoto.current) inputFoto.current.value = "";
  };

  const iniciarEdicao = (p) => {
    limparFormulario();
    setEmEdicao(p.id);
    setForm({
      nome: p.nome,
      descricao: p.descricao,
      ativo: p.ativo,
      precos: Object.fromEntries(
        TAMANHOS.map((t) => [t, p.tamanhos.find((x) => x.tamanho === t)?.preco || ""]),
      ),
    });
    setFotoAtual(p.foto);
    setMensagem(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const escolherFoto = async (e) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setMensagem(null);
    try {
      const blob = await prepararFoto(arquivo);
      setFotoNova((antiga) => {
        if (antiga?.previa) URL.revokeObjectURL(antiga.previa);
        return { blob, previa: URL.createObjectURL(blob) };
      });
      setRemoverFoto(false);
    } catch (err) {
      setMensagem({ tipo: "erro", texto: err.message });
      e.target.value = "";
    }
  };

  const enviarFoto = (id, blob) =>
    fetch(`${API_URL}/pratos/${id}/foto`, {
      method: "PUT",
      headers: cabecalho({ "Content-Type": blob.type }),
      body: blob,
    }).then(checar);

  const salvar = async (e) => {
    e.preventDefault();
    const opcoes = TAMANHOS.filter((t) => Number(form.precos[t]) > 0).map((t) => ({
      tamanho: t,
      preco: Number(form.precos[t]),
    }));
    if (!form.nome.trim() || opcoes.length === 0) {
      setMensagem({ tipo: "erro", texto: "Preencha o nome e pelo menos um preço." });
      return;
    }

    setSalvando(true);
    setMensagem(null);
    try {
      const corpo = JSON.stringify({
        nome: form.nome.trim(),
        descricao: form.descricao.trim(),
        ativo: form.ativo,
        opcoes,
      });
      const editando = emEdicao !== null;
      const res = await fetch(editando ? `${API_URL}/pratos/${emEdicao}` : `${API_URL}/pratos`, {
        method: editando ? "PUT" : "POST",
        headers: cabecalho({ "Content-Type": "application/json" }),
        body: corpo,
      }).then(checar);
      const dados = await res.json();
      const id = editando ? emEdicao : dados.id_prato;

      let avisoFoto = "";
      if (fotoNova) {
        try {
          await enviarFoto(id, fotoNova.blob);
        } catch {
          avisoFoto = " A marmita foi salva, mas a foto não foi enviada. Tente anexar de novo.";
        }
      } else if (removerFoto && editando) {
        await fetch(`${API_URL}/pratos/${id}/foto`, { method: "DELETE", headers: cabecalho() }).catch(() => {});
      }

      await carregarMenu();
      limparFormulario();
      setMensagem({
        tipo: avisoFoto ? "erro" : "ok",
        texto: (editando ? "Marmita atualizada!" : "Marmita cadastrada!") + avisoFoto,
      });
    } catch (err) {
      setMensagem({ tipo: "erro", texto: err.message || "Erro ao salvar." });
    } finally {
      setSalvando(false);
    }
  };

  const excluir = (p) => {
    if (!window.confirm(`Excluir "${p.nome}" do cardápio? Isso não pode ser desfeito.`)) return;
    fetch(`${API_URL}/pratos/${p.id}`, { method: "DELETE", headers: cabecalho() })
      .then(checar)
      .then(() => {
        if (emEdicao === p.id) limparFormulario();
        setMensagem({ tipo: "ok", texto: "Marmita excluída." });
        return carregarMenu();
      })
      .catch((err) => setMensagem({ tipo: "erro", texto: err.message }));
  };

  const alternarAtivo = (p) => {
    fetch(`${API_URL}/pratos/${p.id}`, {
      method: "PUT",
      headers: cabecalho({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        nome: p.nome,
        descricao: p.descricao,
        ativo: !p.ativo,
        opcoes: p.tamanhos.filter((t) => t.preco > 0),
      }),
    })
      .then(checar)
      .then(carregarMenu)
      .catch((err) => setMensagem({ tipo: "erro", texto: err.message }));
  };

  const campo = (chave) => (e) => setForm((f) => ({ ...f, [chave]: e.target.value }));
  const previa = removerFoto ? null : fotoNova?.previa || fotoAtual;

  // ── Tela de login ───────────────────────────────────────
  if (!autenticado) {
    return (
      <div className="admin admin-login">
        <form className="admin-card login-card" onSubmit={entrar}>
          <span className="login-ico">
            <IconCadeado size={26} />
          </span>
          <h1>Área restrita</h1>
          <p>Digite a senha de administrador para gerenciar o cardápio.</p>
          <label htmlFor="senha" className="sr-only">Senha</label>
          <input
            id="senha"
            type="password"
            className="campo"
            placeholder="Senha"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          {erroLogin && <p className="msg erro" role="alert">{erroLogin}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={entrando}>
            {entrando ? "Verificando…" : "Entrar"}
          </button>
          <button type="button" className="link-voltar" onClick={aoSair}>
            ← Voltar para o site
          </button>
        </form>
      </div>
    );
  }

  // ── Painel ──────────────────────────────────────────────
  return (
    <div className="admin">
      <header className="admin-topo">
        <div className="container admin-topo-inner">
          <div>
            <h1>Painel GiuFit</h1>
            <p>Cadastre pratos, preços e fotos. As mudanças aparecem no site na hora.</p>
          </div>
          <div className="admin-topo-acoes">
            <button type="button" className="btn btn-ghost" onClick={aoSair}>Ver o site</button>
            <button type="button" className="btn btn-ghost" onClick={() => { sair(); }}>Sair</button>
          </div>
        </div>
      </header>

      <div className="container admin-grid">
        <form className="admin-card" onSubmit={salvar}>
          <h2>{emEdicao ? "Editar marmita" : "Nova marmita"}</h2>

          <div className="foto-campo">
            <div className="foto-previa">
              {previa ? <img src={previa} alt="Prévia da foto" /> : <PratoIlustrado />}
            </div>
            <div className="foto-acoes">
              <input
                ref={inputFoto}
                id="foto"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={escolherFoto}
              />
              <label htmlFor="foto" className="btn btn-ghost">
                <IconCamera size={18} /> {previa ? "Trocar foto" : "Anexar foto"}
              </label>
              {previa && (
                <button
                  type="button"
                  className="link-perigo"
                  onClick={() => {
                    setFotoNova(null);
                    setRemoverFoto(Boolean(fotoAtual));
                    setFotoAtual(null);
                    if (inputFoto.current) inputFoto.current.value = "";
                  }}
                >
                  Remover foto
                </button>
              )}
              <small>Escolha da galeria ou tire na hora. A foto é reduzida automaticamente.</small>
            </div>
          </div>

          <label className="rotulo" htmlFor="nome">Nome do prato</label>
          <input id="nome" className="campo" maxLength={100} placeholder="Ex: Escondidinho de patinho" value={form.nome} onChange={campo("nome")} required />

          <label className="rotulo" htmlFor="desc">Descrição</label>
          <textarea id="desc" className="campo" rows={3} maxLength={500} placeholder="Ingredientes e detalhes" value={form.descricao} onChange={campo("descricao")} />

          <span className="rotulo">Preços por tamanho (deixe em branco os que não vende)</span>
          <div className="precos">
            {TAMANHOS.map((t) => (
              <label key={t} className="preco-campo">
                <span>{t}</span>
                <input
                  className="campo"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="R$ 0,00"
                  value={form.precos[t]}
                  onChange={(e) => setForm((f) => ({ ...f, precos: { ...f.precos, [t]: e.target.value } }))}
                />
              </label>
            ))}
          </div>

          <label className="check">
            <input type="checkbox" checked={form.ativo} onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))} />
            Mostrar no cardápio do site
          </label>

          {mensagem && (
            <p className={`msg ${mensagem.tipo}`} role={mensagem.tipo === "erro" ? "alert" : "status"}>
              {mensagem.texto}
            </p>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={salvando}>
            {salvando ? "Salvando…" : emEdicao ? "Salvar alterações" : "Cadastrar marmita"}
          </button>
          {emEdicao && (
            <button type="button" className="link-voltar" onClick={limparFormulario}>
              Cancelar edição
            </button>
          )}
        </form>

        <section aria-labelledby="titulo-lista">
          <h2 id="titulo-lista" className="lista-titulo">
            Cardápio ({menu.length}) {carregando && <small>atualizando…</small>}
          </h2>
          {menu.length === 0 && !carregando ? (
            <p className="vazio-admin">Nenhuma marmita cadastrada ainda.</p>
          ) : (
            <ul className="lista">
              {menu.map((p) => (
                <li key={p.id} className={`linha ${p.ativo ? "" : "oculto"}`}>
                  <div className="linha-foto">
                    {p.foto ? <img src={p.foto} alt="" loading="lazy" /> : <PratoIlustrado />}
                  </div>
                  <div className="linha-info">
                    <strong>{p.nome}</strong>
                    <div className="etiquetas">
                      {!p.ativo && <span className="tag oculto-tag">Oculto no site</span>}
                      {p.tamanhos.map((t) => (
                        <span className="tag" key={t.tamanho}>{t.tamanho}: {moeda(t.preco)}</span>
                      ))}
                    </div>
                  </div>
                  <div className="linha-acoes">
                    <button type="button" className="btn-mini" onClick={() => iniciarEdicao(p)} aria-label={`Editar ${p.nome}`} title="Editar">
                      <IconLapis size={18} />
                    </button>
                    <button type="button" className="btn-mini" onClick={() => alternarAtivo(p)} title={p.ativo ? "Ocultar do site" : "Mostrar no site"}>
                      {p.ativo ? "Ocultar" : "Mostrar"}
                    </button>
                    <button type="button" className="btn-mini perigo" onClick={() => excluir(p)} aria-label={`Excluir ${p.nome}`} title="Excluir">
                      <IconLixeira size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
