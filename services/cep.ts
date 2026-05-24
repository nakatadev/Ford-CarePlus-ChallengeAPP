import { CepAddress } from "@/types";

export async function fetchAddressByCep(cep: string): Promise<CepAddress> {
  const normalized = cep.replace(/\D/g, "");

  if (normalized.length !== 8) {
    throw new Error("Informe um CEP com 8 digitos.");
  }

  const response = await fetch(`https://viacep.com.br/ws/${normalized}/json/`);

  if (!response.ok) {
    throw new Error("Nao foi possivel consultar o CEP agora.");
  }

  const data = await response.json();

  if (data.erro) {
    throw new Error("CEP nao encontrado.");
  }

  return {
    cep: data.cep,
    logradouro: data.logradouro,
    bairro: data.bairro,
    localidade: data.localidade,
    uf: data.uf
  };
}
