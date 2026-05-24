import { Box, SimpleGrid, Heading, Text, Flex, Icon } from "@chakra-ui/react";
import { FiUsers, FiShoppingBag, FiDollarSign, FiClock } from "react-icons/fi";
import { useAppContext } from "../../lib/store";

const StatCard = ({ title, value, icon, color }: { title: string; value: string; icon: any; color: string }) => (
  <Box
    bg="white"
    borderRadius="24px"
    p={6}
    boxShadow="0 18px 50px rgba(113, 77, 109, 0.08)"
    border="1px solid rgba(223, 206, 223, 0.8)"
    transition="transform 0.25s, box-shadow 0.25s"
    _hover={{
      transform: "translateY(-4px)",
      boxShadow: "0 22px 60px rgba(113, 77, 109, 0.12)",
    }}
  >
    <Flex justifyContent="space-between" alignItems="center" mb={4}>
      <Text color="#6a5a6a" fontWeight="600" fontSize="sm">
        {title}
      </Text>
      <Flex bg={`${color}.50`} p={3} borderRadius="full">
        <Icon as={icon} color={`${color}.500`} boxSize={5} />
      </Flex>
    </Flex>
    <Heading size="lg" color="#5e3860">
      {value}
    </Heading>
  </Box>
);

export default function DashboardPage() {
  const { sales, customers, conditionals } = useAppContext();

  const totalSalesValue = sales.reduce((acc, sale) => acc + (sale.totalValue || 0), 0);
  const formattedSalesValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSalesValue);
  
  const totalOrders = sales.length;
  const totalCustomers = customers.length;
  const activeConditionals = conditionals.filter(c => c.status === "active").length;

  return (
    <Box>
      <Heading mb={4}>Visão Geral</Heading>
      <Text color="#6a5a6a" mb={8}>
        Bem-vindo ao painel de controle da Loja Alzira.
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <StatCard title="Vendas Totais" value={formattedSalesValue} icon={FiDollarSign} color="pink" />
        <StatCard title="Pedidos Realizados" value={totalOrders.toString()} icon={FiShoppingBag} color="purple" />
        <StatCard title="Clientes Registrados" value={totalCustomers.toString()} icon={FiUsers} color="blue" />
        <StatCard title="Condicionais Ativos" value={activeConditionals.toString()} icon={FiClock} color="orange" />
      </SimpleGrid>
      
    </Box>
  );
}
