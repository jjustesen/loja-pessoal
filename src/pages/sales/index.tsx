import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  NumberInput,
  NumberInputField,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { nanoid } from "nanoid";
import { useAppContext } from "../../lib/store";
import { type PaymentCondition, type Product, type Sale } from "../../types";

export default function SalesPage() {
  const { customers, products, paymentMethods, sales, addSale } =
    useAppContext();
  const toast = useToast();

  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );
  const [cart, setCart] = useState<Product[]>([]);
  const [barcode, setBarcode] = useState("");
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<
    string | null
  >(null);
  const [paymentCondition, setPaymentCondition] =
    useState<PaymentCondition>("in_full");
  const [installments, setInstallments] = useState(2);

  const handleAddProductToCart = () => {
    if (!barcode) return;
    const product = products.find((p) => p.barcode === barcode);
    if (product) {
      setCart([...cart, product]);
      setBarcode(""); // Clear input after adding
    } else {
      toast({
        title: "Erro",
        description: "Produto não encontrado.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const totalValue = cart.reduce((acc, p) => acc + p.sellingPrice, 0);

  const handleCreateSale = async () => {
    if (!selectedCustomerId) {
      toast({
        title: "Erro",
        description: "Selecione um cliente.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (cart.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um produto.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!selectedPaymentMethodId) {
      toast({
        title: "Erro",
        description: "Selecione uma forma de pagamento.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const customer = customers.find((c) => c.id === selectedCustomerId);
    const paymentMethod = paymentMethods.find(
      (pm) => pm.id === selectedPaymentMethodId
    );

    if (!customer || !paymentMethod) {
      toast({
        title: "Erro",
        description: "Cliente ou forma de pagamento inválida.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newSale: Sale = {
      id: nanoid(),
      customer,
      products: cart,
      paymentMethod,
      totalValue,
      paymentCondition,
      createdAt: new Date().toISOString(),
    };

    if (paymentCondition === "installments") {
      const installmentValue = totalValue / installments;
      newSale.installments = Array.from({ length: installments }, (_, i) => {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i + 1);
        return {
          id: nanoid(),
          saleId: newSale.id,
          installmentNumber: i + 1,
          value: installmentValue,
          dueDate: dueDate.toISOString(),
          status: "pending",
        };
      });
    }

    await addSale(newSale);

    // Reset form
    setSelectedCustomerId(null);
    setCart([]);
    setSelectedPaymentMethodId(null);
    setPaymentCondition("in_full");
    setInstallments(2);

    toast({
      title: "Sucesso",
      description: "Venda registrada com sucesso.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box>
      <Heading mb={4}>Registro de Vendas</Heading>

      <Flex direction="column" gap={4}>
        <FormControl>
          <FormLabel>Cliente</FormLabel>
          <Select
            placeholder="Selecione um cliente"
            value={selectedCustomerId ?? ""}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
          >
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Adicionar Produto (pelo código de barras)</FormLabel>
          <Flex gap={2}>
            <Input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Digite ou escaneie o código de barras"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddProductToCart();
                }
              }}
            />
            <Button onClick={handleAddProductToCart}>Adicionar</Button>
          </Flex>
        </FormControl>

        <Box borderWidth="1px" borderRadius="lg" p={4}>
          <Heading size="md" mb={2}>
            Carrinho
          </Heading>
          {cart.length === 0 ? (
            <Text>Nenhum produto no carrinho.</Text>
          ) : (
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Produto</Th>
                  <Th isNumeric>Preço</Th>
                </Tr>
              </Thead>
              <Tbody>
                {cart.map((product, index) => (
                  <Tr key={`${product.barcode}-${index}`}>
                    <Td>{product.name}</Td>
                    <Td isNumeric>{product.sellingPrice.toFixed(2)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
          <Text fontWeight="bold" mt={4} textAlign="right">
            Total: R$ {totalValue.toFixed(2)}
          </Text>
        </Box>

        <Flex gap={4}>
          <FormControl>
            <FormLabel>Forma de Pagamento</FormLabel>
            <Select
              placeholder="Selecione a forma de pagamento"
              value={selectedPaymentMethodId ?? ""}
              onChange={(e) => setSelectedPaymentMethodId(e.target.value)}
            >
              {paymentMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Condição de Pagamento</FormLabel>
            <RadioGroup
              onChange={(val) => setPaymentCondition(val as PaymentCondition)}
              value={paymentCondition}
            >
              <Stack direction="row">
                <Radio value="in_full">À vista</Radio>
                <Radio value="installments">Parcelado</Radio>
              </Stack>
            </RadioGroup>
          </FormControl>
        </Flex>

        {paymentCondition === "installments" && (
          <FormControl>
            <FormLabel>Número de Parcelas</FormLabel>
            <NumberInput
              min={2}
              value={installments}
              onChange={(_, val) => setInstallments(val)}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>
        )}

        <Button colorScheme="teal" onClick={handleCreateSale} mt={4}>
          Finalizar Venda
        </Button>
      </Flex>

      <Heading size="lg" mt={8} mb={4}>
        Histórico de Vendas
      </Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Cliente</Th>
            <Th>Produtos</Th>
            <Th>Forma de Pgto.</Th>
            <Th>Condição</Th>
            <Th isNumeric>Valor Total</Th>
            <Th>Data</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sales.map((sale) => (
            <Tr key={sale.id}>
              <Td>{sale.customer.name}</Td>
              <Td>{sale.products.map((p) => p.name).join(", ")}</Td>
              <Td>{sale.paymentMethod.name}</Td>
              <Td>
                {sale.paymentCondition === "in_full"
                  ? "À vista"
                  : `${sale.installments?.length}x`}
              </Td>
              <Td isNumeric>{sale.totalValue.toFixed(2)}</Td>
              <Td>{new Date(sale.createdAt).toLocaleString()}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
