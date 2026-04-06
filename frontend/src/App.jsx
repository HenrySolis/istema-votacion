import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import HomePage from './pages/public/HomePage.jsx';
import VotePage from './pages/public/VotePage.jsx';
import ThanksPage from './pages/public/ThanksPage.jsx';
import ClosedPollPage from './pages/public/ClosedPollPage.jsx';

import LoginPage from './pages/admin/LoginPage.jsx';
import DashboardPage from './pages/admin/DashboardPage.jsx';
import PollListPage from './pages/admin/PollListPage.jsx';
import PollCreatePage from './pages/admin/PollCreatePage.jsx';
import PollEditPage from './pages/admin/PollEditPage.jsx';
import PollResultsPage from './pages/admin/PollResultsPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página de inicio pública */}
        <Route path="/" element={<HomePage />} />

        {/* Rutas públicas */}
        <Route path="/votar/:slug" element={<VotePage />} />
        <Route path="/gracias" element={<ThanksPage />} />
        <Route path="/encuesta-cerrada" element={<ClosedPollPage />} />
        <Route path="/no-disponible" element={<ClosedPollPage message="Esta encuesta no está disponible en este momento." />} />

        {/* Rutas admin */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route index element={<DashboardPage />} />
          <Route path="encuestas" element={<PollListPage />} />
          <Route path="encuestas/nueva" element={<PollCreatePage />} />
          <Route path="encuestas/:id" element={<PollEditPage />} />
          <Route path="encuestas/:id/resultados" element={<PollResultsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
