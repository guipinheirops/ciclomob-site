# Ciclo MOB — publicação na Cloudflare

Este pacote contém o código-fonte completo da página de vendas e a rota do
formulário de leads. Por possuir uma rota de servidor (`/api/lead`), publique-o
como **Cloudflare Worker**, e não como um site estático do Pages.

## Requisitos

- Node.js 22.13 ou superior
- Conta Cloudflare
- Wrangler autenticado (`npx wrangler login`)

## Publicação

1. Extraia o ZIP e abra o terminal dentro da pasta `ciclo-mob`.
2. Execute `npm ci`.
3. Cadastre o segredo do proxy:

   ```bash
   npx wrangler secret put LEAD_PROXY_SECRET
   ```

   Informe o mesmo segredo configurado na Edge Function `ciclo-mob-lead` do
   Supabase. Não grave esse valor em nenhum arquivo do projeto.

4. Publique com:

   ```bash
   npm run deploy:cloudflare
   ```

   No painel **Workers Builds**, configure o comando de implantação como
   `npm run deploy:cloudflare`. Não use `npx wrangler deploy` isoladamente e
   não aceite a migração automática para OpenNext: este projeto já utiliza
   Vinext e publica com a configuração gerada em `dist/server/wrangler.json`.

5. No painel Cloudflare, vincule o domínio personalizado:

   `app.ciclomob.cuidadosdamulher.com.br`

## Domínios permitidos no formulário

Por padrão, a rota aceita o domínio acima e o endereço atual hospedado no
ChatGPT Sites. Para alterar a lista, configure a variável `ALLOWED_ORIGINS`
com URLs separadas por vírgula, sempre incluindo `https://` e sem barra final.

Exemplo:

```text
https://app.ciclomob.cuidadosdamulher.com.br,https://www.ciclomob.com.br
```

## Verificação

Após publicar, teste o formulário no domínio final. Uma resposta
“Origem não autorizada” indica que o domínio acessado precisa ser acrescentado
em `ALLOWED_ORIGINS`.
