import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
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
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  FormControl,
  FormLabel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { useState } from "react";
import { useAppContext } from "../../lib/store";
import { nanoid } from "nanoid";
import type { Conditional, ConditionalProduct, Sale } from "../../types";

interface ConditionalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConditionalReportModal({
  isOpen,
  onClose,
}: ConditionalReportModalProps) {
  const { state, dispatch } = useAppContext();
  const { conditionals, paymentMethods } = state;
  const toast = useToast();

  const [selectedConditionalForSale, setSelectedConditionalForSale] =
    useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  // Filtros e análises
  const completedConditionals = conditionals.filter(
    (c) => c.status !== "active"
  );
  const notReturnedProducts: Array<{
    conditional: Conditional;
    product: ConditionalProduct;
  }> = [];

  completedConditionals.forEach((conditional) => {
    conditional.products.forEach((cp) => {
      if (!cp.returned) {
        notReturnedProducts.push({ conditional, product: cp });
      }
    });
  });

  const totalValueNotReturned = notReturnedProducts.reduce(
    (total, item) =>
      total + item.product.product.sellingPrice * item.product.quantity,
    0
  );

  const handleCreateSaleFromConditional = () => {
    if (!selectedConditionalForSale) {
      toast({
        title: "Erro",
        description: "Selecione um condicional para criar a venda.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!selectedPaymentMethod) {
      toast({
        title: "Erro",
        description: "Selecione uma forma de pagamento.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const conditional = conditionals.find(
      (c) => c.id === selectedConditionalForSale
    );
    if (!conditional) {
      toast({
        title: "Erro",
        description: "Condicional não encontrado.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Produtos não devolvidos deste condicional
    const productsToSell = conditional.products.filter((cp) => !cp.returned);

    if (productsToSell.length === 0) {
      toast({
        title: "Erro",
        description: "Não há produtos não devolvidos neste condicional.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const paymentMethod = paymentMethods.find(
      (pm) => pm.id === selectedPaymentMethod
    );
    if (!paymentMethod) {
      toast({
        title: "Erro",
        description: "Forma de pagamento não encontrada.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Converte produtos condicionais para produtos da venda
    const saleProducts = productsToSell.map((cp) => cp.product);
    const totalValue = productsToSell.reduce(
      (total, cp) => total + cp.product.sellingPrice * cp.quantity,
      0
    );

    const newSale: Sale = {
      id: nanoid(),
      customer: conditional.customer,
      products: saleProducts,
      paymentMethod,
      totalValue,
      paymentCondition: "in_full",
      createdAt: new Date().toISOString(),
    };

    dispatch({
      type: "ADD_SALE",
      payload: newSale,
    });

    toast({
      title: "Venda criada",
      description: `Venda de R$ ${totalValue.toFixed(
        2
      )} criada com produtos não devolvidos do condicional.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    setSelectedConditionalForSale("");
    setSelectedPaymentMethod("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "blue";
      case "returned":
        return "green";
      case "completed":
        return "orange";
      default:
        return "gray";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "returned":
        return "Devolvido";
      case "completed":
        return "Finalizado";
      default:
        return "Desconhecido";
    }
  };

  // Condicionais com produtos não devolvidos
  const conditionalsWithNotReturned = completedConditionals.filter(
    (conditional) => conditional.products.some((cp) => !cp.returned)
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Relatórios de Condicionais</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Tabs variant="enclosed">
            <TabList>
              <Tab>Resumo Geral</Tab>
              <Tab>Produtos Não Devolvidos</Tab>
              <Tab>Gerar Venda</Tab>
            </TabList>

            <TabPanels>
              {/* Aba Resumo Geral */}
              <TabPanel>
                <VStack spacing={6}>
                  <HStack spacing={8} w="100%">
                    <Stat>
                      <StatLabel>Total de Condicionais</StatLabel>
                      <StatNumber>{conditionals.length}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Condicionais Ativos</StatLabel>
                      <StatNumber>
                        {
                          conditionals.filter((c) => c.status === "active")
                            .length
                        }
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Condicionais Finalizados</StatLabel>
                      <StatNumber>{completedConditionals.length}</StatNumber>
                    </Stat>
                  </HStack>

                  <HStack spacing={8} w="100%">
                    <Stat>
                      <StatLabel>Produtos Não Devolvidos</StatLabel>
                      <StatNumber>{notReturnedProducts.length}</StatNumber>
                      <StatHelpText>
                        Valor: R$ {totalValueNotReturned.toFixed(2)}
                      </StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>Taxa de Devolução</StatLabel>
                      <StatNumber>
                        {completedConditionals.length > 0
                          ? Math.round(
                              (completedConditionals.filter(
                                (c) => c.status === "returned"
                              ).length /
                                completedConditionals.length) *
                                100
                            )
                          : 0}
                        %
                      </StatNumber>
                    </Stat>
                  </HStack>
                </VStack>
              </TabPanel>

              {/* Aba Produtos Não Devolvidos */}
              <TabPanel>
                <VStack spacing={4}>
                  {notReturnedProducts.length === 0 ? (
                    <Alert status="success">
                      <AlertIcon />
                      <AlertTitle>Parabéns!</AlertTitle>
                      <AlertDescription>
                        Todos os produtos foram devolvidos.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <Alert status="warning">
                        <AlertIcon />
                        <AlertTitle>Produtos Pendentes</AlertTitle>
                        <AlertDescription>
                          {notReturnedProducts.length} produtos não foram
                          devolvidos, totalizando R${" "}
                          {totalValueNotReturned.toFixed(2)}.
                        </AlertDescription>
                      </Alert>

                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Condicional</Th>
                            <Th>Cliente</Th>
                            <Th>Produto</Th>
                            <Th>Quantidade</Th>
                            <Th>Valor Unit.</Th>
                            <Th>Valor Total</Th>
                            <Th>Data do Condicional</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {notReturnedProducts.map((item, index) => (
                            <Tr key={index}>
                              <Td>{item.conditional.id.slice(0, 8)}</Td>
                              <Td>{item.conditional.customer.name}</Td>
                              <Td>{item.product.product.name}</Td>
                              <Td>{item.product.quantity}</Td>
                              <Td>
                                R${" "}
                                {item.product.product.sellingPrice.toFixed(2)}
                              </Td>
                              <Td>
                                R${" "}
                                {(
                                  item.product.product.sellingPrice *
                                  item.product.quantity
                                ).toFixed(2)}
                              </Td>
                              <Td>
                                {new Date(
                                  item.conditional.createdAt
                                ).toLocaleDateString()}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </>
                  )}
                </VStack>
              </TabPanel>

              {/* Aba Gerar Venda */}
              <TabPanel>
                <VStack spacing={6}>
                  <Alert status="info">
                    <AlertIcon />
                    <AlertTitle>Gerar Venda</AlertTitle>
                    <AlertDescription>
                      Selecione um condicional para criar uma venda com os
                      produtos não devolvidos.
                    </AlertDescription>
                  </Alert>

                  <FormControl>
                    <FormLabel>Condicional</FormLabel>
                    <Select
                      placeholder="Selecione um condicional com produtos não devolvidos"
                      value={selectedConditionalForSale}
                      onChange={(e) =>
                        setSelectedConditionalForSale(e.target.value)
                      }
                    >
                      {conditionalsWithNotReturned.map((conditional) => {
                        const notReturnedCount = conditional.products.filter(
                          (cp) => !cp.returned
                        ).length;
                        const notReturnedValue = conditional.products
                          .filter((cp) => !cp.returned)
                          .reduce(
                            (total, cp) =>
                              total + cp.product.sellingPrice * cp.quantity,
                            0
                          );

                        return (
                          <option key={conditional.id} value={conditional.id}>
                            {conditional.id.slice(0, 8)} -{" "}
                            {conditional.customer.name}({notReturnedCount}{" "}
                            produtos - R$ {notReturnedValue.toFixed(2)})
                          </option>
                        );
                      })}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Forma de Pagamento</FormLabel>
                    <Select
                      placeholder="Selecione a forma de pagamento"
                      value={selectedPaymentMethod}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    >
                      {paymentMethods.map((pm) => (
                        <option key={pm.id} value={pm.id}>
                          {pm.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  {selectedConditionalForSale && (
                    <Box w="100%" p={4} bg="blue.50" borderRadius="md">
                      <Text fontSize="lg" fontWeight="bold" mb={2}>
                        Prévia da Venda
                      </Text>
                      {(() => {
                        const conditional = conditionals.find(
                          (c) => c.id === selectedConditionalForSale
                        );
                        if (!conditional) return null;

                        const productsToSell = conditional.products.filter(
                          (cp) => !cp.returned
                        );
                        const totalValue = productsToSell.reduce(
                          (total, cp) =>
                            total + cp.product.sellingPrice * cp.quantity,
                          0
                        );

                        return (
                          <VStack align="start" spacing={2}>
                            <Text>Cliente: {conditional.customer.name}</Text>
                            <Text>Produtos: {productsToSell.length}</Text>
                            <Text fontWeight="bold">
                              Valor Total: R$ {totalValue.toFixed(2)}
                            </Text>
                          </VStack>
                        );
                      })()}
                    </Box>
                  )}

                  <Button
                    colorScheme="green"
                    size="lg"
                    onClick={handleCreateSaleFromConditional}
                    isDisabled={
                      !selectedConditionalForSale || !selectedPaymentMethod
                    }
                  >
                    Gerar Venda
                  </Button>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Fechar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
