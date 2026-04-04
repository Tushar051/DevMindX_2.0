import { Routes, Route, Navigate } from "react-router-dom";
import { MarketingLayout } from "@/layouts/MarketingLayout";
import { AppShell } from "@/layouts/AppShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { OAuthCallbackHandler } from "@/components/OAuthCallbackHandler";
import { Home } from "@/pages/Home";
import { Features } from "@/pages/Features";
import { LoginPage } from "@/pages/auth/Login";
import { SignupPage } from "@/pages/auth/Signup";
import { NotFound } from "@/pages/NotFound";
import { GeneratorPage } from "@/pages/app/GeneratorPage";
import { IdePage } from "@/pages/app/IdePage";
import { ProjectsPage } from "@/pages/app/ProjectsPage";
import { ResearchPage } from "@/pages/app/ResearchPage";
import { ArchitecturePage } from "@/pages/app/ArchitecturePage";
import { LearningPage } from "@/pages/app/LearningPage";
import { ModelCheckoutPage } from "@/pages/app/ModelCheckoutPage";
import { ProfilePage } from "@/pages/app/ProfilePage";

export const App = () => {
  return (
    <>
      <OAuthCallbackHandler />
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="app" element={<AppShell />}>
            <Route index element={<Navigate to="generator" replace />} />
            <Route path="generator" element={<GeneratorPage />} />
            <Route path="ide" element={<IdePage />} />
            <Route path="checkout/model/:modelId" element={<ModelCheckoutPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="research" element={<ResearchPage />} />
            <Route path="architecture" element={<ArchitecturePage />} />
            <Route path="learning" element={<LearningPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};
