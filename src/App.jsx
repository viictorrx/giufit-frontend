import { useState } from "react";
import Loja from "./Loja";
import AdminPanel from "./AdminPanel";

export default function App() {
  // Começa mostrando a loja para os clientes
  const [view, setView] = useState("loja");

  // Funções para trocar de ecrã
  const irParaAdmin = () => setView("admin");
  const irParaLoja = () => setView("loja");

  // Se o estado for "admin", mostra o seu painel atual
  if (view === "admin") {
    return (
      <div>
        {/* Um botão simples para si conseguir voltar à loja depois de gerir as marmitas */}
        <button
          onClick={irParaLoja}
          style={{
            padding: "10px",
            background: "#4a8c1c",
            color: "white",
            border: "none",
            width: "100%",
            cursor: "pointer",
          }}
        >
          ← Voltar para a Loja
        </button>
        <AdminPanel />
      </div>
    );
  }

  // Caso contrário, mostra a loja nova espetacular
  return <Loja irParaAdmin={irParaAdmin} />;
}
