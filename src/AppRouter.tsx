import { useState } from "react";
import AppLayout from "./components/AppLayout";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import WelcomePage from "./pages/WelcomePage";

export default function AppRouter() {
  const [currentPage, setCurrentPage] = useState("welcome");

  const navigate = (page) => setCurrentPage(page);

  return (
    <AppLayout>
      {currentPage === "welcome" && <WelcomePage onNavigate={navigate} />}
      {currentPage === "register" && <RegisterPage onNavigate={navigate} />}
      {currentPage === "login" && (
        <LoginPage
          onLoginSuccess={() => navigate("chat")}
          onNavigate={navigate}
        />
      )}
      {currentPage === "chat" && <ChatPage />}
      {!['welcome', 'register', 'login', 'chat'].includes(currentPage) && (
        <WelcomePage onNavigate={navigate} />
      )}
    </AppLayout>
  );
}
