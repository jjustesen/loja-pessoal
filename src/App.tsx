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
  <Box>
    <Flex
      as="nav"
      bg="teal.500"
      color="white"
      padding={4}
      justifyContent="space-between"
      alignItems="center"
    >
      <Heading size="md">Loja Alzira</Heading>
      <Nav />
    </Flex>
    <Box p={4}>
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
