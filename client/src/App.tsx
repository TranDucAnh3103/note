import { lazy, Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useThemeStore } from "@/store/themeStore";
import MainLayout from "@/layouts/MainLayout";
import LoadingScreen from "@/components/ui/LoadingScreen";

// Lazy load pages
const HomePage = lazy(() => import("@/pages/HomePage"));
const NotesPage = lazy(() => import("@/pages/NotesPage"));
const ArchivedPage = lazy(() => import("@/pages/ArchivedPage"));
const NoteDetailPage = lazy(() => import("@/pages/NoteDetailPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const StatisticsPage = lazy(() => import("@/pages/StatisticsPage"));
const TagPage = lazy(() => import("@/pages/TagPage"));

function App() {
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <MainLayout>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/notes/:id" element={<NoteDetailPage />} />
          <Route path="/folder/:folderId" element={<NotesPage />} />
          <Route path="/archived" element={<ArchivedPage />} />
          <Route path="/tag/:tag" element={<TagPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
        </Routes>
      </Suspense>
    </MainLayout>
  );
}

export default App;
