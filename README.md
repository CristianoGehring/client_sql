# Client SQL - Cliente SQL Modular

Um cliente SQL moderno e extensível inspirado no Insomnia, com suporte a múltiplos bancos de dados e interface intuitiva para desenvolvedores.

## 🚀 Características

- **Interface Moderna**: Design inspirado no Insomnia com tema escuro/claro
- **Múltiplos Bancos**: Suporte a MySQL, PostgreSQL, SQLite e SQL Server
- **Editor Avançado**: Syntax highlighting, autocomplete e formatação SQL
- **Gerenciamento de Conexões**: Salvar e gerenciar múltiplas conexões
- **Histórico e Favoritos**: Acompanhar queries executadas
- **Visualização de Schema**: Tree view de bancos, tabelas e procedures
- **Resultados Editáveis**: Tabela de resultados com paginação
- **Extensível**: Sistema de plugins para novos drivers

## 🛠️ Tecnologias

- **Backend**: Node.js + TypeScript + Electron
- **Frontend**: React + TypeScript + Redux Toolkit
- **UI**: Tailwind CSS + Lucide React
- **Editor**: Monaco Editor (mesmo do VS Code)
- **Banco de Dados**: MySQL2, PostgreSQL, SQLite3

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Instalação Local

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd client_sql

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Criar executável
npm run dist
```

## 🏗️ Arquitetura

```
src/
├── core/                 # Lógica principal
│   ├── interfaces/      # Interfaces dos drivers
│   └── factories/       # Factory para drivers
├── drivers/             # Implementações específicas
│   └── mysql/          # Driver MySQL
├── main/               # Processo principal do Electron
├── shared/             # Tipos compartilhados
└── ui/                 # Interface React
    ├── components/     # Componentes React
    └── store/          # Redux store e slices
```

## 🔌 Sistema de Drivers

O projeto usa um sistema de drivers modular baseado no padrão Factory Method:

```typescript
// Registrar um novo driver
DatabaseDriverFactory.registerDriver(DatabaseType.MYSQL, MySQLDriver);

// Criar instância do driver
const driver = DatabaseDriverFactory.createDriver(DatabaseType.MYSQL);
```

### Implementando um Novo Driver

1. Implementar a interface `IDatabaseDriver`
2. Registrar o driver na factory
3. Adicionar tipos no enum `DatabaseType`

## 🎨 Interface

### Layout Principal

- **Sidebar Esquerda**: Conexões, histórico, favoritos
- **Área Central**: Editor de queries com abas
- **Área Inferior**: Resultados em tabela
- **Sidebar Direita**: Schema do banco

### Temas

- **Dark Theme** (padrão): Interface escura para desenvolvimento
- **Light Theme**: Tema claro para ambientes bem iluminados
- **Densidade**: Compacto, normal, espaçoso

## 📋 Funcionalidades

### Gerenciamento de Conexões

- ✅ Salvar múltiplas conexões
- ✅ Teste de conexão
- ✅ Histórico de conexões
- ✅ Grupos/organização
- 🔄 Criptografia de credenciais

### Editor de Queries

- ✅ Abas múltiplas
- ✅ Syntax highlighting
- 🔄 Auto-complete
- 🔄 Formatação SQL
- ✅ Bookmarks/favoritos

### Visualização de Dados

- ✅ Resultados em tabela
- ✅ Visualização JSON/RAW
- 🔄 Export CSV/JSON/Excel
- 🔄 Paginação

### Gerenciamento de Database

- ✅ Tree view de schema
- ✅ Visualização de estrutura
- 🔄 Quick peek em dados
- 🔄 Filtros e buscas

## 🚧 Roadmap

### Versão 1.0 (MVP) - Em Desenvolvimento
- [x] Arquitetura base
- [x] Driver MySQL
- [x] Interface básica
- [x] Editor de queries
- [ ] Gerenciamento de conexões
- [ ] Visualização de resultados

### Versão 2.0
- [ ] PostgreSQL e SQLite
- [ ] Sistema de plugins
- [ ] Melhorias no editor
- [ ] Auto-complete avançado

### Versão 3.0
- [ ] Time travel de queries
- [ ] Comparação de resultados
- [ ] Visualização de dados (gráficos)
- [ ] Colaboração em tempo real

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Diretrizes de Código

- Use TypeScript strict mode
- Siga as convenções do ESLint
- Escreva testes para novos drivers
- Documente APIs públicas

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- Inspirado no [Insomnia](https://insomnia.rest/)
- Ícones por [Lucide](https://lucide.dev/)
- Editor baseado no [Monaco Editor](https://microsoft.github.io/monaco-editor/)

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/client_sql/issues)
- **Discord**: [Link do Discord]
- **Email**: seu-email@exemplo.com

---

Desenvolvido com ❤️ para a comunidade de desenvolvedores 