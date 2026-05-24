import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { Box, Flex, Heading, Button, Spinner, Center } from "@chakra-ui/react";
import { Nav } from "./components/nav";
import DashboardPage from "./pages/dashboard";
import ProductsPage from "./pages/products";
import CustomersPage from "./pages/customers";
import SalesPage from "./pages/sales";
import SettingsPage from "./pages/settings";
import InstallmentsPage from "./pages/installments";
import ConditionalsPage from "./pages/conditionals";
import LoginPage from "./pages/login";
import { useEffect } from "react";
import { useAppContext } from "./lib/store";
import { signOut } from "firebase/auth";
import { auth } from "./lib/firebase";

const Layout = () => (
  <Box minH="100vh" bg="#f8f2f7" color="#2d2d2d" fontFamily="'Inter', system-ui, sans-serif">
    <Box px={4} py={4}>
      <Flex
        as="nav"
        bg="rgba(255, 255, 255, 0.85)"
        backdropFilter="blur(10px)"
        border="1px solid rgba(223, 206, 223, 0.6)"
        boxShadow="0 4px 20px rgba(113, 77, 109, 0.06)"
        borderRadius="16px"
        padding="1rem 1.5rem"
        justifyContent="space-between"
        alignItems="center"
        maxW="1240px"
        mx="auto"
      >
        <Heading size="md" color="#5e3860" letterSpacing="-0.01em" fontWeight="800">
          Luz da Moda
        </Heading>
        <Flex alignItems="center" gap={4}>
          <Nav />
          <Button
            size="sm"
            variant="outline"
            colorScheme="purple"
            borderRadius="10px"
            onClick={() => signOut(auth)}
          >
            Sair
          </Button>
        </Flex>
      </Flex>
    </Box>
    <Box p={4} maxW="1240px" mx="auto">
      <Outlet />
    </Box>
  </Box>
);

function AppRoutes() {
  const { user, authLoading } = useAppContext();

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key.toLowerCase() === "h" || e.key.toLowerCase() === "j")) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Enquanto verifica se o usuário está logado, mostra um spinner
  if (authLoading) {
    return (
      <Center minH="100vh" bg="#f8f2f7">
        <Spinner size="xl" color="#7b4e8e" thickness="4px" />
      </Center>
    );
  }

  // Se não estiver logado, só mostra a rota de login
  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  // Se estiver logado, mostra o painel completo
  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="conditionals" element={<ConditionalsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="installments" element={<InstallmentsPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return <AppRoutes />;
}

export default App;
