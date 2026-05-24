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
import { maskCurrency, unmaskCurrency } from "../../lib/masks";

export default function ProductsPage() {
  const { products, addProduct, deleteProduct } = useAppContext();
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
      costPrice: unmaskCurrency(costPrice),
      sellingPrice: unmaskCurrency(sellingPrice),
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
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
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
            value={costPrice}
            onChange={(e) => setCostPrice(maskCurrency(e.target.value))}
            placeholder="R$ 0,00"
          />
        </FormControl>
        <FormControl>
          <FormLabel>Preço de Venda</FormLabel>
          <Input
            value={sellingPrice}
            onChange={(e) => setSellingPrice(maskCurrency(e.target.value))}
            placeholder="R$ 0,00"
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
            <Th>Ações</Th>
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
              <Td>
                <Button 
                  size="sm" 
                  colorScheme="red" 
                  variant="outline"
                  onClick={async () => {
                    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
                      await deleteProduct((product as any).id ?? product.barcode);
                      toast({ title: "Excluído", status: "info", duration: 2000 });
                    }
                  }}
                >
                  Excluir
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
