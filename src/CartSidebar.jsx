import { moeda } from "./api";
import { IconCarrinho, IconChat, IconFechar, IconMais, IconMenos, PratoIlustrado } from "./components/Icons";

export default function CartSidebar({ aberto, fechar, carrinho, alterarQtd, total, finalizarPedido }) {
  return (
    <>
      <div className={`fundo ${aberto ? "aberto" : ""}`} onClick={fechar} aria-hidden="true" />
      <aside
        className={`gaveta ${aberto ? "aberta" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Seu pedido"
        inert={!aberto}
      >
        <div className="gaveta-cab">
          <h2>Seu pedido</h2>
          <button type="button" className="btn-icone" onClick={fechar} aria-label="Fechar carrinho">
            <IconFechar />
          </button>
        </div>

        {carrinho.length === 0 ? (
          <div className="vazio">
            <IconCarrinho size={44} />
            <p>
              Seu carrinho está vazio.
              <br />
              Adicione algumas marmitas!
            </p>
            <button type="button" className="btn btn-primary" onClick={fechar}>
              Ver cardápio
            </button>
          </div>
        ) : (
          <>
            <div className="itens">
              {carrinho.map((item) => (
                <div className="item" key={item.chave}>
                  <div className="item-foto">
                    {item.foto ? <img src={item.foto} alt="" /> : <PratoIlustrado />}
                  </div>
                  <div>
                    <h3>{item.nome}</h3>
                    <small>{item.tamanho}</small>
                    <div className="qtd">
                      <button type="button" onClick={() => alterarQtd(item.chave, -1)} aria-label={`Diminuir ${item.nome}`}>
                        <IconMenos size={16} />
                      </button>
                      <span aria-live="polite">{item.qtd}</span>
                      <button type="button" onClick={() => alterarQtd(item.chave, 1)} aria-label={`Aumentar ${item.nome}`}>
                        <IconMais size={16} />
                      </button>
                    </div>
                  </div>
                  <span className="item-preco">{moeda(item.preco * item.qtd)}</span>
                </div>
              ))}
            </div>
            <div className="gaveta-rodape">
              <div className="total">
                <span>Total</span>
                <strong>{moeda(total)}</strong>
              </div>
              <button type="button" className="btn btn-whats btn-block" onClick={finalizarPedido}>
                <IconChat size={20} /> Pedir pelo WhatsApp
              </button>
              <p className="nota">Você confirma o pedido e a entrega direto com a gente.</p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
