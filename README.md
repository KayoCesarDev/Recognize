# Reconheça

Aplicação de reconhecimento social para destacar pessoas que fazem a diferença.

## Rodando localmente

1. Instale as dependências com `npm install`
2. Crie um arquivo `.env.local`
3. Configure as variáveis do backend atual

```env
VITE_BASE44_APP_ID=seu_app_id
VITE_BASE44_APP_BASE_URL=sua_url_do_backend
```

4. Rode o projeto com `npm run dev`

## Publicação com domínio gratuito

Como você ainda não tem domínio próprio, a opção mais simples é publicar em uma destas plataformas:

- Vercel, com subdomínio no formato `reconheca.vercel.app`
- Netlify, com subdomínio no formato `reconheca.netlify.app`

Observação: a disponibilidade do nome depende do momento da publicação.

## Importante

O projeto ainda usa o backend do Base44 para autenticação, dados e integrações. Se você quiser remover essa dependência no futuro, será preciso migrar o backend para outro serviço.
