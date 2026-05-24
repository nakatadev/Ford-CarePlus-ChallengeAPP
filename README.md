# Ford Care+

Aplicativo mobile desenvolvido para a Sprint de Mobile Development & IoT da FIAP em parceria com a Ford.

## Sobre o projeto

O desafio escolhido foi o **Desafio 02 - Impulsionando o VIN Share na America do Sul com Solucoes Inteligentes**.

A proposta do Ford Care+ e aproximar o cliente da rede oficial de pos-venda. O app ajuda o usuario a acompanhar a revisao do veiculo, consultar servicos recomendados, localizar concessionarias e agendar atendimentos. A cada agendamento, o cliente soma pontos em um programa de beneficios, criando um incentivo direto para continuar usando a rede Ford.

## Funcionalidades

- Dashboard com dados do veiculo, VIN, placa, quilometragem e status da proxima revisao.
- Recomendacao de revisao baseada na quilometragem atual.
- Atualizacao e persistencia local da quilometragem com AsyncStorage.
- Lista de servicos de manutencao priorizada conforme necessidade do veiculo.
- Fluxo de agendamento de servico na rede oficial.
- Programa de beneficios com pontos de fidelidade.
- Consulta de CEP usando a API publica ViaCEP.
- Tela de concessionarias sugeridas.
- Feedback visual para carregamento, erros de formulario e operacoes assincronas.

## Integrantes


- Rodrigo Nakata - 556417
- Nome completo - RM000000
- Nome completo - RM000000


## Stack

- React Native
- Expo
- Expo Router
- TypeScript
- AsyncStorage
- ViaCEP API

## Como rodar

Pre-requisitos:

- Node.js `20.19.4` ou superior
- Aplicativo Expo Go no celular

Versao usada no desenvolvimento: `20.20.2`. Quem usa `nvm` pode rodar `nvm use`.

O projeto foi fixado no Expo SDK 54 para manter compatibilidade com Expo Go em aparelhos que ainda nao aceitam SDKs mais novos.

Passos:

```bash
npm install
npm start
```

Depois, leia o QR Code exibido no terminal com o Expo Go.

## Estrutura do projeto

```txt
app/                 Rotas e telas do Expo Router
components/          Componentes visuais reutilizaveis
constants/           Cores e tokens simples de interface
context/             Estado global e persistencia local
data/                Dados simulados do veiculo, servicos e concessionarias
services/            Integracoes externas, como ViaCEP
utils/               Regras de recomendacao de manutencao
```

## Integracao externa

O app usa a API publica ViaCEP para consultar o endereco a partir de um CEP informado pelo usuario. Essa consulta aparece na tela **Rede**, com estado de carregamento e mensagem de erro quando o CEP e invalido ou nao encontrado.

Endpoint utilizado:

```txt
https://viacep.com.br/ws/{cep}/json/
```

## Decisoes tecnicas

A navegacao foi feita com Expo Router porque ele simplifica a organizacao das telas por arquivos e atende diretamente ao conteudo trabalhado em mobile. O estado compartilhado do veiculo, pontuacao e agendamentos fica em um contexto React, com persistencia local via AsyncStorage para manter os dados mesmo apos fechar o app.

Os dados de servicos e concessionarias foram simulados para representar um cenario real de pos-venda. A regra de manutencao usa a quilometragem do veiculo para indicar prioridade, conectando a experiencia do app ao objetivo de aumentar a retencao na rede oficial.

## Demonstracao visual

Prints do aplicativo:

### Tela inicial

![Tela inicial do Ford Care+](public/main-app-ford.jfif)

### Revisoes e servicos

![Tela de revisoes e servicos](public/second-app-ford.jfif)

### Agendamento

![Tela de agendamento de servico](public/add-app-ford.jfif)

### Beneficios e relacionamento

![Tela de beneficios do Ford Care+](public/last-app-ford.jfif)

Adicionar antes da entrega:

- GIF ou video curto demonstrando o fluxo principal.

Essas pendencias tambem estao listadas em `TODO_LOCAL.md`, que nao deve ser enviado ao GitHub.

## Proximos passos

- Integrar login do cliente.
- Usar geolocalizacao real para concessionarias proximas.
- Enviar notificacoes locais antes da data da revisao.
- Conectar o agendamento com um backend real da concessionaria.
- Exibir historico oficial de servicos pelo VIN.
