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
  Badge,
  useToast,
  Checkbox,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { useState } from "react";
import { useAppContext } from "../../lib/store";
import type { Conditional } from "../../types";

interface ReturnConditionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  conditional: Conditional;
}

export function ReturnConditionalModal({
  isOpen,
  onClose,
  conditional,
}: ReturnConditionalModalProps) {
  const { updateConditionalProductReturn, completeConditional } =
    useAppContext();
  const toast = useToast();

  const [barcode, setBarcode] = useState("");
  const [isManualMode, setIsManualMode] = useState(false);

  const handleBarcodeReturn = async () => {
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

    // Encontra o produto no condicional
    const productInConditional = conditional.products.find(
      (cp) => cp.product.barcode === barcode.trim() && !cp.returned
    );

    if (!productInConditional) {
      const alreadyReturned = conditional.products.find(
        (cp) => cp.product.barcode === barcode.trim() && cp.returned
      );

      if (alreadyReturned) {
        toast({
          title: "Produto já devolvido",
          description: `O produto ${alreadyReturned.product.name} já foi marcado como devolvido.`,
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Produto não encontrado",
          description: `Código ${barcode} não encontrado neste condicional ou já foi devolvido.`,
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      }
      setBarcode("");
      return;
    }

    // Marca o produto como devolvido
    await updateConditionalProductReturn(conditional.id, barcode.trim());

    toast({
      title: "Produto devolvido",
      description: `${productInConditional.product.name} marcado como devolvido.`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });

    setBarcode("");
  };

  const handleManualToggle = async (
    productBarcode: string,
    returned: boolean
  ) => {
    await updateConditionalProductReturn(conditional.id, productBarcode);

    const product = conditional.products.find(
      (cp) => cp.product.barcode === productBarcode
    );
    toast({
      title: returned
        ? "Produto marcado como não devolvido"
        : "Produto devolvido",
      description: `${product?.product.name} ${returned ? "desmarcado" : "marcado como devolvido"
        }.`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleCompleteReturn = async () => {
    await completeConditional(conditional.id);

    const returnedCount = conditional.products.filter(
      (cp) => cp.returned
    ).length;
    const totalCount = conditional.products.length;

    toast({
      title: "Devolução processada",
      description: `Condicional finalizado. ${returnedCount} de ${totalCount} produtos devolvidos.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBarcodeReturn();
    }
  };

  const returnedProducts = conditional.products.filter((cp) => cp.returned);
  const notReturnedProducts = conditional.products.filter((cp) => !cp.returned);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Processar Devolução - {conditional.customer.name}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6}>
            {/* Informações do Condicional */}
            <Alert status="info">
              <AlertIcon />
              <Box>
                <AlertTitle>
                  Condicional #{conditional.id.slice(0, 8)}
                </AlertTitle>
                <AlertDescription>
                  Cliente: {conditional.customer.name} | Total de produtos:{" "}
                  {conditional.products.length} | Criado em:{" "}
                  {new Date(conditional.createdAt).toLocaleString()}
                </AlertDescription>
              </Box>
            </Alert>

            {/* Controles */}
            <VStack spacing={4} w="100%">
              <Checkbox
                isChecked={isManualMode}
                onChange={(e) => setIsManualMode(e.target.checked)}
              >
                Modo manual (marcar/desmarcar produtos individualmente)
              </Checkbox>

              {!isManualMode && (
                <FormControl>
                  <FormLabel>Código de Barras para Devolução</FormLabel>
                  <HStack>
                    <Input
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="Digite ou escaneie o código de barras"
                      onKeyPress={handleKeyPress}
                      autoFocus
                    />
                    <Button colorScheme="green" onClick={handleBarcodeReturn}>
                      Devolver
                    </Button>
                  </HStack>
                </FormControl>
              )}
            </VStack>

            {/* Lista de Produtos Não Devolvidos */}
            {notReturnedProducts.length > 0 && (
              <Box w="100%">
                <Text fontSize="lg" fontWeight="bold" mb={4} color="orange.600">
                  Produtos Pendentes de Devolução ({notReturnedProducts.length})
                </Text>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Código</Th>
                      <Th>Produto</Th>
                      <Th>Quantidade</Th>
                      <Th>Status</Th>
                      {isManualMode && <Th>Ação</Th>}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {notReturnedProducts.map((cp, index) => (
                      <Tr key={`${cp.product.barcode}-${index}`} bg="orange.50">
                        <Td>{cp.product.barcode}</Td>
                        <Td>{cp.product.name}</Td>
                        <Td>{cp.quantity}</Td>
                        <Td>
                          <Badge colorScheme="orange">Pendente</Badge>
                        </Td>
                        {isManualMode && (
                          <Td>
                            <Button
                              size="sm"
                              colorScheme="green"
                              onClick={() =>
                                handleManualToggle(
                                  cp.product.barcode,
                                  cp.returned
                                )
                              }
                            >
                              Marcar Devolvido
                            </Button>
                          </Td>
                        )}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}

            {/* Lista de Produtos Devolvidos */}
            {returnedProducts.length > 0 && (
              <Box w="100%">
                <Text fontSize="lg" fontWeight="bold" mb={4} color="green.600">
                  Produtos Devolvidos ({returnedProducts.length})
                </Text>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Código</Th>
                      <Th>Produto</Th>
                      <Th>Quantidade</Th>
                      <Th>Status</Th>
                      <Th>Data de Devolução</Th>
                      {isManualMode && <Th>Ação</Th>}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {returnedProducts.map((cp, index) => (
                      <Tr key={`${cp.product.barcode}-${index}`} bg="green.50">
                        <Td>{cp.product.barcode}</Td>
                        <Td>{cp.product.name}</Td>
                        <Td>{cp.quantity}</Td>
                        <Td>
                          <Badge colorScheme="green">Devolvido</Badge>
                        </Td>
                        <Td>
                          {cp.returnedAt &&
                            new Date(cp.returnedAt).toLocaleString()}
                        </Td>
                        {isManualMode && (
                          <Td>
                            <Button
                              size="sm"
                              colorScheme="orange"
                              variant="outline"
                              onClick={() =>
                                handleManualToggle(
                                  cp.product.barcode,
                                  cp.returned
                                )
                              }
                            >
                              Desmarcar
                            </Button>
                          </Td>
                        )}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}

            {/* Resumo */}
            <Box w="100%" p={4} bg="gray.50" borderRadius="md">
              <Text fontSize="lg" fontWeight="bold">
                Resumo da Devolução
              </Text>
              <Text>
                Produtos devolvidos: {returnedProducts.length} de{" "}
                {conditional.products.length}
              </Text>
              <Text>Produtos pendentes: {notReturnedProducts.length}</Text>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button colorScheme="teal" onClick={handleCompleteReturn}>
            Finalizar Devolução
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
