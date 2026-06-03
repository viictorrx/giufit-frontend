// src/CartSidebar.jsx
import { styles } from "./styles";

const fmt = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function CartSidebar({
  carrinho,
  carrinhoAberto,
  setCarrinhoAberto,
  altQtd,
  total,
  finalizarPedido,
}) {
  return (
    <>
      <div
        style={{
          ...styles.overlay,
          opacity: carrinhoAberto ? 1 : 0,
          pointerEvents: carrinhoAberto ? "all" : "none",
        }}
        onClick={() => setCarrinhoAberto(false)}
      />
      <aside
        style={{
          ...styles.sidebar,
          transform: carrinhoAberto ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <div style={styles.sideHead}>
          <h2 style={styles.sideTitle}>🛒 Seu pedido</h2>
          <button
            style={styles.closeBtn}
            onClick={() => setCarrinhoAberto(false)}
          >
            ✕
          </button>
        </div>

        {carrinho.length === 0 ? (
          <div style={styles.emptyCart}>
            <span style={{ fontSize: 48 }}>🍱</span>
            <p>
              Seu carrinho está vazio.
              <br />
              Adicione marmitas!
            </p>
          </div>
        ) : (
          <>
            <div style={styles.cartItems}>
              {carrinho.map((item) => (
                <div key={item.chave} style={styles.cartItem}>
                  <span style={styles.cartEmoji}>{item.emoji}</span>
                  <div style={styles.cartInfo}>
                    <strong style={styles.cartName}>{item.nome}</strong>
                    <span style={styles.cartTam}>{item.tamanho}</span>
                  </div>
                  <div style={styles.cartQtd}>
                    <button
                      style={styles.qtdBtn}
                      onClick={() => altQtd(item.chave, -1)}
                    >
                      −
                    </button>
                    <span style={styles.qtdNum}>{item.qtd}</span>
                    <button
                      style={styles.qtdBtn}
                      onClick={() => altQtd(item.chave, 1)}
                    >
                      +
                    </button>
                  </div>
                  <span style={styles.cartPreco}>
                    {fmt(item.preco * item.qtd)}
                  </span>
                </div>
              ))}
            </div>
            <div style={styles.cartFooter}>
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total</span>
                <span style={styles.totalVal}>{fmt(total)}</span>
              </div>
              <button style={styles.whatsBtn} onClick={finalizarPedido}>
                Pedir pelo WhatsApp 💬
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
