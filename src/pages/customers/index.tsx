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
import { maskPhone } from "../../lib/masks";

export default function CustomersPage() {
  const { customers, addCustomer, deleteCustomer } = useAppContext();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const toast = useToast();

  const handleAddCustomer = async () => {
    if (!name) {
      toast({
        title: "Erro",
        description: "O campo nome é obrigatório.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    await addCustomer({ name, phone, email });

    // Clear form
    setName("");
    setPhone("");
    setEmail("");

    toast({
      title: "Sucesso",
      description: "Cliente adicionado com sucesso.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box>
      <Heading mb={4}>Cadastro de Clientes</Heading>

      <Flex gap={4} mb={8}>
        <FormControl isRequired>
          <FormLabel>Nome</FormLabel>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: João da Silva"
          />
        </FormControl>
        <FormControl>
          <FormLabel>Telefone</FormLabel>
          <Input
            value={phone}
            onChange={(e) => setPhone(maskPhone(e.target.value))}
            placeholder="(99) 99999-9999"
          />
        </FormControl>
        <FormControl>
          <FormLabel>E-mail</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="joao@exemplo.com"
          />
        </FormControl>
      </Flex>
      <Button colorScheme="teal" onClick={handleAddCustomer}>
        Adicionar Cliente
      </Button>

      <Heading size="lg" mt={8} mb={4}>
        Lista de Clientes
      </Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Nome</Th>
            <Th>Telefone</Th>
            <Th>E-mail</Th>
            <Th>Data de Cadastro</Th>
            <Th>Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {customers.map((customer) => (
            <Tr key={customer.id}>
              <Td>{customer.name}</Td>
              <Td>{customer.phone}</Td>
              <Td>{customer.email}</Td>
              <Td>{new Date(customer.createdAt).toLocaleString()}</Td>
              <Td>
                <Button 
                  size="sm" 
                  colorScheme="red" 
                  variant="outline"
                  onClick={async () => {
                    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
                      await deleteCustomer(customer.id);
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
