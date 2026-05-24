import {
  Link as RouterLink,
  type LinkProps as RouterLinkProps,
} from "react-router-dom";
import {
  Box,
  Link as ChakraLink,
  type LinkProps as ChakraLinkProps,
} from "@chakra-ui/react";

type NavLinkProps = ChakraLinkProps & RouterLinkProps;

const NavLink = (props: NavLinkProps) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return (
    <ChakraLink
      as={RouterLink}
      px="1.1rem"
      py="0.55rem"
      borderRadius="999px"
      fontWeight="600"
      fontSize="0.9rem"
      textDecoration="none"
      color="#7c3f60"
      bg="transparent"
      border="1px solid transparent"
      transition="background 0.2s, border-color 0.2s, color 0.2s"
      _hover={{
        bg: "#f5d3e2",
        borderColor: "#d19ab4",
        color: "#5e3860",
        textDecoration: "none",
      }}
      {...props}
    />
  );
};

export function Nav() {
  return (
    <Box>
      <NavLink to="/" mr={4}>
        Dashboard
      </NavLink>
      <NavLink to="/products" mr={4}>
        Produtos
      </NavLink>
      <NavLink to="/customers" mr={4}>
        Clientes
      </NavLink>
      <NavLink to="/sales" mr={4}>
        Vendas
      </NavLink>
      <NavLink to="/conditionals" mr={4}>
        Condicionais
      </NavLink>
      <NavLink to="/installments" mr={4}>
        Parcelas
      </NavLink>
      <NavLink to="/settings">Configurações</NavLink>
    </Box>
  );
}
