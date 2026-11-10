# TASK-014 — Relatório de vendas

- **Estado:** DONE em 2026-11-09. Migration aplicada; usuário confirmou que o painel corresponde à consulta independente.
- **Filtro:** datas inicial e final inclusivas como dias corridos em `America/Sao_Paulo`, decisão confirmada pelo usuário. A query converte início à meia-noite e final para limite exclusivo do dia seguinte.
- **Métricas:** quantidade de pedidos com pagamento simulado aprovado e não cancelados; produtos líquidos (`subtotal_cents - discount_cents`); frete agregado em separado. O painel não mostra dados pessoais de compradores.
- **Autorização:** RPC `admin_sales_report` exige papel administrativo no banco, valida período e usa `SECURITY DEFINER` com `search_path` fechado. A interface oferece apenas leitura agregada.
- **Arquivos principais:** `supabase/migrations/20261109000007_admin_sales_report.sql`, `src/features/admin/AdminPanel.tsx`, `src/features/admin/AdminPanel.css`, `README.md`, `docs/architecture/data-model.md`.
- **Validação executada:** `npm run build` passou; `npm run lint` passou; `git diff --check` passou.
- **Validação manual:** migration `20261109000007_admin_sales_report.sql` aplicada com sucesso. Intervalo 2026-01-01 a 2026-12-31: consulta direta retornou 2 pedidos, 21980 centavos em produtos líquidos e 3000 centavos em frete; usuário confirmou que os totais do painel bateram.
