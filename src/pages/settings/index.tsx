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

export default function SettingsPage() {
  const { state, dispatch } = useAppContext();
  const { paymentMethods } = state;
  const [newMethodName, setNewMethodName] = useState("");
  const toast = useToast();

  const handleAddMethod = () => {
    if (!newMethodName) {
      toast({
        title: "Erro",
        description: "O nome da forma de pagamento é obrigatório.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    dispatch({
      type: "ADD_PAYMENT_METHOD",
      payload: { name: newMethodName },
    });

    setNewMethodName("");

    toast({
      title: "Sucesso",
      description: "Forma de pagamento adicionada com sucesso.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box>
      <Heading mb={4}>Configurações</Heading>

      <Heading size="lg" mb={4}>
        Formas de Pagamento
      </Heading>

      <Flex gap={4} mb={8}>
        <FormControl>
          <FormLabel>Nova Forma de Pagamento</FormLabel>
          <Input
            value={newMethodName}
            onChange={(e) => setNewMethodName(e.target.value)}
            placeholder="Ex: Vale Alimentação"
          />
        </FormControl>
        <Button colorScheme="teal" onClick={handleAddMethod} mt={8}>
          Adicionar
        </Button>
      </Flex>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Nome</Th>
          </Tr>
        </Thead>
        <Tbody>
          {paymentMethods.map((method) => (
            <Tr key={method.id}>
              <Td>{method.name}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
