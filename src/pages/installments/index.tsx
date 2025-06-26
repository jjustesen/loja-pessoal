import {
  Box,
  Button,
  Heading,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  Tag,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  NumberInput,
  NumberInputField,
  FormControl,
  FormLabel,
  Text,
  HStack,
} from "@chakra-ui/react";
import { useAppContext } from "../../lib/store";
import { useState } from "react";
import type { Installment } from "../../types";

interface ExtendedInstallment extends Installment {
  customerName: string;
  saleId: string;
}

export default function InstallmentsPage() {
  const { sales, updateInstallmentStatus, payInstallmentPartial } =
    useAppContext();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selectedInstallment, setSelectedInstallment] = useState<{
    saleId: string;
    installmentId: string;
    currentValue: number;
    paidAmount: number;
    customerName: string;
    installmentNumber: number;
  } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const allInstallments = sales
    .filter((sale) => sale.installments && sale.installments.length > 0)
    .flatMap((sale) =>
      sale.installments!.map((inst) => ({
        ...inst,
        customerName: sale.customer.name,
        saleId: sale.id,
      }))
    );

  const handlePayInstallment = async (
    saleId: string,
    installmentId: string
  ) => {
    await updateInstallmentStatus(saleId, installmentId);
    toast({
      title: "Sucesso!",
      description: "Parcela marcada como paga.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleOpenPaymentModal = (inst: ExtendedInstallment) => {
    const remainingAmount = inst.value - (inst.paidAmount || 0);
    setSelectedInstallment({
      saleId: inst.saleId,
      installmentId: inst.id,
      currentValue: inst.value,
      paidAmount: inst.paidAmount || 0,
      customerName: inst.customerName,
      installmentNumber: inst.installmentNumber,
    });
    setPaymentAmount(remainingAmount);
    onOpen();
  };

  const handlePartialPayment = async () => {
    if (!selectedInstallment || paymentAmount <= 0) {
      toast({
        title: "Erro!",
        description: "Valor de pagamento inválido.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    await payInstallmentPartial(
      selectedInstallment.saleId,
      selectedInstallment.installmentId,
      paymentAmount
    );

    let description = "";
    const remainingAmount =
      selectedInstallment.currentValue - selectedInstallment.paidAmount;

    if (paymentAmount >= remainingAmount) {
      if (paymentAmount > remainingAmount) {
        description = `Parcela paga integralmente! Excesso de R$ ${(
          paymentAmount - remainingAmount
        ).toFixed(2)} aplicado nas próximas parcelas.`;
      } else {
        description = "Parcela paga integralmente!";
      }
    } else {
      description = `Pagamento parcial de R$ ${paymentAmount.toFixed(
        2
      )} registrado. Saldo remanescente distribuído nas próximas parcelas.`;
    }

    toast({
      title: "Sucesso!",
      description,
      status: "success",
      duration: 5000,
      isClosable: true,
    });

    onClose();
    setSelectedInstallment(null);
    setPaymentAmount(0);
  };

  return (
    <Box>
      <Heading mb={4}>Controle de Parcelas</Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Cliente</Th>
            <Th>Nº da Parcela</Th>
            <Th isNumeric>Valor</Th>
            <Th isNumeric>Pago</Th>
            <Th isNumeric>Restante</Th>
            <Th>Vencimento</Th>
            <Th>Status</Th>
            <Th>Ação</Th>
          </Tr>
        </Thead>
        <Tbody>
          {allInstallments.map((inst) => {
            const paidAmount = inst.paidAmount || 0;
            const remainingAmount = inst.value - paidAmount;

            return (
              <Tr key={inst.id}>
                <Td>{inst.customerName}</Td>
                <Td>{inst.installmentNumber}</Td>
                <Td isNumeric>R$ {inst.value.toFixed(2)}</Td>
                <Td isNumeric>R$ {paidAmount.toFixed(2)}</Td>
                <Td isNumeric>R$ {remainingAmount.toFixed(2)}</Td>
                <Td>{new Date(inst.dueDate).toLocaleDateString()}</Td>
                <Td>
                  <Tag
                    colorScheme={inst.status === "paid" ? "green" : "orange"}
                  >
                    {inst.status === "paid" ? "Paga" : "Pendente"}
                  </Tag>
                </Td>
                <Td>
                  {inst.status === "pending" && (
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={() => handleOpenPaymentModal(inst)}
                      >
                        Pagar
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="green"
                        variant="outline"
                        onClick={() =>
                          handlePayInstallment(inst.saleId, inst.id)
                        }
                      >
                        Marcar Paga
                      </Button>
                    </HStack>
                  )}
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Pagamento de Parcela</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedInstallment && (
              <>
                <Text mb={4}>
                  <strong>Cliente:</strong> {selectedInstallment.customerName}
                </Text>
                <Text mb={4}>
                  <strong>Parcela:</strong>{" "}
                  {selectedInstallment.installmentNumber}
                </Text>
                <Text mb={4}>
                  <strong>Valor da Parcela:</strong> R${" "}
                  {selectedInstallment.currentValue.toFixed(2)}
                </Text>
                <Text mb={4}>
                  <strong>Já Pago:</strong> R${" "}
                  {selectedInstallment.paidAmount.toFixed(2)}
                </Text>
                <Text mb={4}>
                  <strong>Valor Restante:</strong> R${" "}
                  {(
                    selectedInstallment.currentValue -
                    selectedInstallment.paidAmount
                  ).toFixed(2)}
                </Text>

                <FormControl>
                  <FormLabel>Valor a Pagar</FormLabel>
                  <NumberInput
                    value={paymentAmount}
                    onChange={(_, val) => setPaymentAmount(val || 0)}
                    min={0}
                    precision={2}
                    step={0.01}
                  >
                    <NumberInputField placeholder="0,00" />
                  </NumberInput>
                  <Text fontSize="sm" color="gray.600" mt={2}>
                    Você pode pagar qualquer valor. Se pagar menos que o
                    restante, a diferença será distribuída nas próximas
                    parcelas. Se pagar mais, o excesso será aplicado nas
                    próximas parcelas.
                  </Text>
                </FormControl>
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={handlePartialPayment}>
              Confirmar Pagamento
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
