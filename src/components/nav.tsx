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
  return <ChakraLink as={RouterLink} {...props} />;
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
