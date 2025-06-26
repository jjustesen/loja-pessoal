import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useAppContext } from "../../lib/store";

export default function ProductsPage() {
  const { products, addProduct } = useAppContext();
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const toast = useToast();

  const handleAddProduct = async () => {
    if (!barcode || !name || !costPrice || !sellingPrice) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    await addProduct({
      barcode,
      name,
      costPrice: parseFloat(costPrice),
      sellingPrice: parseFloat(sellingPrice),
    });

    // Clear form
    setBarcode("");
    setName("");
    setCostPrice("");
    setSellingPrice("");

    toast({
      title: "Sucesso",
      description: "Produto adicionado com sucesso.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box>
      <Heading mb={4}>Cadastro de Produtos</Heading>

      <Flex gap={4} mb={8}>
        <FormControl>
          <FormLabel>Código de Barras</FormLabel>
          <Input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Digite ou escaneie o código de barras"
          />
        </FormControl>
        <FormControl>
          <FormLabel>Nome do Produto</FormLabel>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Coca-Cola 2L"
          />
        </FormControl>
      </Flex>
      <Flex gap={4} mb={8}>
        <FormControl>
          <FormLabel>Preço de Custo</FormLabel>
          <Input
            type="number"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            placeholder="Ex: 5.50"
          />
        </FormControl>
        <FormControl>
          <FormLabel>Preço de Venda</FormLabel>
          <Input
            type="number"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            placeholder="Ex: 8.00"
          />
        </FormControl>
      </Flex>
      <Button colorScheme="teal" onClick={handleAddProduct}>
        Adicionar Produto
      </Button>

      <Heading size="lg" mt={8} mb={4}>
        Lista de Produtos
      </Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Código de Barras</Th>
            <Th>Nome</Th>
            <Th isNumeric>Preço de Custo</Th>
            <Th isNumeric>Preço de Venda</Th>
            <Th>Data de Cadastro</Th>
          </Tr>
        </Thead>
        <Tbody>
          {products.map((product) => (
            <Tr key={product.barcode}>
              <Td>{product.barcode}</Td>
              <Td>{product.name}</Td>
              <Td isNumeric>{product.costPrice.toFixed(2)}</Td>
              <Td isNumeric>{product.sellingPrice.toFixed(2)}</Td>
              <Td>{new Date(product.createdAt).toLocaleString()}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
