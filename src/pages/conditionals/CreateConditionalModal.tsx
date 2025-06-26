import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  HStack,
  Text,
  Box,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  IconButton,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { useState } from "react";
import { useAppContext } from "../../lib/store";
import { nanoid } from "nanoid";
import type { ConditionalProduct } from "../../types";

interface CreateConditionalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateConditionalModal({
  isOpen,
  onClose,
}: CreateConditionalModalProps) {
  const { products, customers, addConditional } = useAppContext();
  const toast = useToast();

  const [barcode, setBarcode] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [conditionalProducts, setConditionalProducts] = useState<
    ConditionalProduct[]
  >([]);

  const handleBarcodeSubmit = () => {
    if (!barcode.trim()) {
      toast({
        title: "Erro",
        description: "Digite um código de barras válido.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const product = products.find((p) => p.barcode === barcode.trim());
    if (!product) {
      toast({
        title: "Produto não encontrado",
        description: `Código de barras ${barcode} não encontrado no cadastro.`,
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      setBarcode("");
      return;
    }

    // Verifica se o produto já foi adicionado
    const existingProductIndex = conditionalProducts.findIndex(
      (cp) => cp.product.barcode === product.barcode
    );

    if (existingProductIndex >= 0) {
      // Incrementa a quantidade se o produto já existe
      const updatedProducts = [...conditionalProducts];
      updatedProducts[existingProductIndex].quantity += 1;
      setConditionalProducts(updatedProducts);
    } else {
      // Adiciona novo produto
      const newConditionalProduct: ConditionalProduct = {
        product,
        quantity: 1,
        returned: false,
      };
      setConditionalProducts([...conditionalProducts, newConditionalProduct]);
    }

    setBarcode("");
    toast({
      title: "Produto adicionado",
      description: `${product.name} adicionado ao condicional.`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    if (quantity <= 0) return;

    const updatedProducts = [...conditionalProducts];
    updatedProducts[index].quantity = quantity;
    setConditionalProducts(updatedProducts);
  };

  const handleRemoveProduct = (index: number) => {
    const updatedProducts = conditionalProducts.filter((_, i) => i !== index);
    setConditionalProducts(updatedProducts);
  };

  const handleCreateConditional = async () => {
    if (!selectedCustomerId) {
      toast({
        title: "Erro",
        description: "Selecione um cliente para o condicional.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (conditionalProducts.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um produto ao condicional.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const customer = customers.find((c) => c.id === selectedCustomerId);
    if (!customer) {
      toast({
        title: "Erro",
        description: "Cliente selecionado não encontrado.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newConditional = {
      id: nanoid(),
      customer,
      products: conditionalProducts,
      status: "active" as const,
      createdAt: new Date().toISOString(),
    };

    await addConditional(newConditional);

    toast({
      title: "Condicional criado",
      description: `Condicional criado com sucesso para ${customer.name}.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    // Limpar formulário
    setBarcode("");
    setSelectedCustomerId("");
    setConditionalProducts([]);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBarcodeSubmit();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Criar Novo Condicional</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6}>
            {/* Seleção de Cliente */}
            <FormControl>
              <FormLabel>Cliente</FormLabel>
              <Select
                placeholder="Selecione um cliente"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Entrada de Código de Barras */}
            <FormControl>
              <FormLabel>Código de Barras</FormLabel>
              <HStack>
                <Input
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Digite ou escaneie o código de barras"
                  onKeyPress={handleKeyPress}
                  autoFocus
                />
                <Button colorScheme="teal" onClick={handleBarcodeSubmit}>
                  Adicionar
                </Button>
              </HStack>
            </FormControl>

            {/* Lista de Produtos Adicionados */}
            {conditionalProducts.length > 0 && (
              <Box w="100%">
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                  Produtos no Condicional ({conditionalProducts.length})
                </Text>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Código</Th>
                      <Th>Produto</Th>
                      <Th>Quantidade</Th>
                      <Th>Preço Unitário</Th>
                      <Th>Total</Th>
                      <Th>Ações</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {conditionalProducts.map((cp, index) => (
                      <Tr key={`${cp.product.barcode}-${index}`}>
                        <Td>{cp.product.barcode}</Td>
                        <Td>{cp.product.name}</Td>
                        <Td>
                          <NumberInput
                            size="sm"
                            maxW="100px"
                            value={cp.quantity}
                            min={1}
                            onChange={(_, value) =>
                              handleQuantityChange(index, value)
                            }
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </Td>
                        <Td>R$ {cp.product.sellingPrice.toFixed(2)}</Td>
                        <Td>
                          R${" "}
                          {(cp.product.sellingPrice * cp.quantity).toFixed(2)}
                        </Td>
                        <Td>
                          <IconButton
                            aria-label="Remover produto"
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleRemoveProduct(index)}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                <Box mt={4} p={4} bg="gray.50" borderRadius="md">
                  <Text fontSize="lg" fontWeight="bold">
                    Total Geral: R${" "}
                    {conditionalProducts
                      .reduce(
                        (total, cp) =>
                          total + cp.product.sellingPrice * cp.quantity,
                        0
                      )
                      .toFixed(2)}
                  </Text>
                </Box>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button colorScheme="teal" onClick={handleCreateConditional}>
            Criar Condicional
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
