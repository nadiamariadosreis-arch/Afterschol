import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Hoje from "./pages/Hoje";
import MinimoViavel from "./pages/MinimoViavel";
import RotinaTempo from "./pages/RotinaTempo";
import SistemaSemanal from "./pages/SistemaSemanal";
import Reset from "./pages/Reset";
import PontosAcumulo from "./pages/PontosAcumulo";
import Criancas from "./pages/Criancas";
import RotinaDiaria from "./pages/RotinaDiaria";
import Plano21 from "./pages/Plano21";
import Metodo from "./pages/Metodo";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Hoje />} />
        <Route path="/minimo" element={<MinimoViavel />} />
        <Route path="/tempo" element={<RotinaTempo />} />
        <Route path="/semanal" element={<SistemaSemanal />} />
        <Route path="/reset" element={<Reset />} />
        <Route path="/pontos" element={<PontosAcumulo />} />
        <Route path="/criancas" element={<Criancas />} />
        <Route path="/rotina-diaria" element={<RotinaDiaria />} />
        <Route path="/plano-21" element={<Plano21 />} />
        <Route path="/metodo" element={<Metodo />} />
      </Route>
    </Routes>
  );
}
