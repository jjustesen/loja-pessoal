import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  useToast,
  Center,
} from "@chakra-ui/react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      toast({ title: "Erro", description: "Preencha email e senha.", status: "error", duration: 3000 });
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/", { replace: true });
    } catch (err: any) {
      toast({ title: "Erro ao autenticar", description: err?.message || "Verifique suas credenciais.", status: "error", duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center minH="100vh" bg="#f8f2f7">
      <Box p={8} bg="white" borderRadius="12px" boxShadow="md" minW="320px">
        <Heading size="md" mb={6} textAlign="center">
          Entrar
        </Heading>
        <FormControl mb={4}>
          <FormLabel>Email</FormLabel>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
        </FormControl>
        <FormControl mb={6}>
          <FormLabel>Senha</FormLabel>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" />
        </FormControl>
        <Button w="full" colorScheme="purple" onClick={handleLogin} isLoading={loading}>
          Entrar
        </Button>
      </Box>
    </Center>
  );
}
