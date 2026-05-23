import {
  Box,
  Button,
  Flex,
  Heading,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Badge,
  HStack,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useAppContext } from "../../lib/store";
import { CreateConditionalModal } from "./CreateConditionalModal";
import { ReturnConditionalModal } from "./ReturnConditionalModal";
import { ConditionalReportModal } from "./ConditionalReportModal";
import type { Conditional } from "../../types";

export default function ConditionalsPage() {
  const { conditionals, deleteConditional } = useAppContext();
  const toast = useToast();

  const createModal = useDisclosure();
  const returnModal = useDisclosure();
  const reportModal = useDisclosure();

  const [selectedConditional, setSelectedConditional] =
    useState<Conditional | null>(null);

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

  const handleReturnConditional = (conditional: Conditional) => {
    setSelectedConditional(conditional);
    returnModal.onOpen();
  };

  const activeConditionals = conditionals.filter((c) => c.status === "active");
  const completedConditionals = conditionals.filter(
    (c) => c.status !== "active"
  );

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Condicionais</Heading>
        <HStack spacing={4}>
          <Button colorScheme="teal" onClick={createModal.onOpen}>
            Novo Condicional
          </Button>
          <Button colorScheme="blue" onClick={reportModal.onOpen}>
            Relatórios
          </Button>
        </HStack>
      </Flex>

      {/* Condicionais Ativos */}
      <Box mb={8}>
        <Heading size="lg" mb={4}>
          Condicionais Ativos ({activeConditionals.length})
        </Heading>
        {activeConditionals.length === 0 ? (
          <Text color="gray.500">Nenhum condicional ativo no momento.</Text>
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Cliente</Th>
                <Th>Produtos</Th>
                <Th>Status</Th>
                <Th>Data de Criação</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {activeConditionals.map((conditional) => (
                <Tr key={conditional.id}>
                  <Td>{conditional.id.slice(0, 8)}</Td>
                  <Td>{conditional.customer.name}</Td>
                  <Td>{conditional.products.length} item(s)</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(conditional.status)}>
                      {getStatusText(conditional.status)}
                    </Badge>
                  </Td>
                  <Td>{new Date(conditional.createdAt).toLocaleString()}</Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="orange"
                      mr={2}
                      onClick={() => handleReturnConditional(conditional)}
                    >
                      Processar Devolução
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={async () => {
                        if (window.confirm("Tem certeza que deseja excluir este condicional?")) {
                          await deleteConditional(conditional.id);
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
        )}
      </Box>

      {/* Histórico de Condicionais */}
      <Box>
        <Heading size="lg" mb={4}>
          Histórico ({completedConditionals.length})
        </Heading>
        {completedConditionals.length === 0 ? (
          <Text color="gray.500">Nenhum condicional no histórico.</Text>
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Cliente</Th>
                <Th>Produtos</Th>
                <Th>Status</Th>
                <Th>Data de Criação</Th>
                <Th>Data de Finalização</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {completedConditionals.map((conditional) => (
                <Tr key={conditional.id}>
                  <Td>{conditional.id.slice(0, 8)}</Td>
                  <Td>{conditional.customer.name}</Td>
                  <Td>{conditional.products.length} item(s)</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(conditional.status)}>
                      {getStatusText(conditional.status)}
                    </Badge>
                  </Td>
                  <Td>{new Date(conditional.createdAt).toLocaleString()}</Td>
                  <Td>
                    {conditional.completedAt &&
                      new Date(conditional.completedAt).toLocaleString()}
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={async () => {
                        if (window.confirm("Tem certeza que deseja excluir este condicional do histórico?")) {
                          await deleteConditional(conditional.id);
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
        )}
      </Box>

      {/* Modais */}
      <CreateConditionalModal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
      />

      {selectedConditional && (
        <ReturnConditionalModal
          isOpen={returnModal.isOpen}
          onClose={() => {
            returnModal.onClose();
            setSelectedConditional(null);
          }}
          conditional={selectedConditional}
        />
      )}

      <ConditionalReportModal
        isOpen={reportModal.isOpen}
        onClose={reportModal.onClose}
      />
    </Box>
  );
}
