import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Verify from "./pages/Verify";
import LandRecords from "./pages/LandRecords";
import RecordDetail from "./pages/RecordDetail";
import Dashboard from "./pages/Dashboard";
import RTI from "./pages/RTI";
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Announcements from "./pages/Announcements";
import Mutation from "./pages/Mutation";
import Encumbrance from "./pages/Encumbrance";
import CadastralMaps from "./pages/CadastralMaps";
import Policies from "./pages/Policies";
import Sitemap from "./pages/Sitemap";
import NotFound from "./pages/NotFound";
import Report from "./pages/Report";

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="verify" element={<Verify />} />
            <Route path="land-records" element={<LandRecords />} />
            <Route path="land-records/:id" element={<RecordDetail />} />
            <Route path="report/:id" element={<Report />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="rti" element={<RTI />} />
            <Route path="help" element={<Help />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<Login />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="mutation" element={<Mutation />} />
            <Route path="encumbrance" element={<Encumbrance />} />
            <Route path="cadastral-maps" element={<CadastralMaps />} />
            <Route path="policies/:slug" element={<Policies />} />
            <Route path="sitemap" element={<Sitemap />} />
            {/* Legacy/typed skip-target URLs must never dead-end on the 404 view. */}
            <Route path="main-content" element={<Navigate to="/" replace />} />
            <Route path="skip-to-main-content" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
