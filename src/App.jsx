import { useEffect, useState } from "react";
import Loja from "./Loja";
import AdminPanel from "./AdminPanel";

// O painel abre em /#admin (e a loja continua sendo a página principal).
const naAreaAdmin = () => window.location.hash === "#admin";

export default function App() {
  const [admin, setAdmin] = useState(naAreaAdmin);

  useEffect(() => {
    const aoMudar = () => setAdmin(naAreaAdmin());
    window.addEventListener("hashchange", aoMudar);
    return () => window.removeEventListener("hashchange", aoMudar);
  }, []);

  const abrirAdmin = () => {
    window.location.hash = "admin";
    window.scrollTo(0, 0);
  };
  const voltarParaLoja = () => {
    history.pushState("", document.title, window.location.pathname);
    setAdmin(false);
    window.scrollTo(0, 0);
  };

  if (admin) return <AdminPanel aoSair={voltarParaLoja} />;
  return <Loja irParaAdmin={abrirAdmin} />;
}
