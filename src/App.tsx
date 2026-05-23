import { Routes, Route, Outlet } from "react-router-dom";
import { Box, Flex, Heading } from "@chakra-ui/react";
import { Nav } from "./components/nav";
import DashboardPage from "./pages/dashboard";
import ProductsPage from "./pages/products";
import CustomersPage from "./pages/customers";
import SalesPage from "./pages/sales";
import SettingsPage from "./pages/settings";
import InstallmentsPage from "./pages/installments";
import ConditionalsPage from "./pages/conditionals";

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
          ✨ Loja Alzira
        </Heading>
        <Nav />
      </Flex>
    </Box>
    <Box p={4} maxW="1240px" mx="auto">
      <Outlet />
    </Box>
  </Box>
);

function App() {
  return (
    <Routes>
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

export default App;
