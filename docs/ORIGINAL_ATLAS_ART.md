# Padrão de imagens e SVGs originais — Atlas Taekwondo para Todos

## Decisão de produto (06/11/2026)

O site terá **identidade ilustrativa própria**, produzida para o projeto. As seis imagens recebidas do mantenedor e as ilustrações de livros e sites terceiros são referências de pesquisa **não autorizadas para redistribuição**. Não copiar, redesenhar por tracing, importar paths vetoriais ou usar versões modificadas dos originais sem direitos documentados. A anatomia humana e posições de Taekwondo são assuntos de estudo; a expressão artística concreta de um diagrama pode ser protegida.

O uso de IA generativa para rascunhos não garante originalidade ou exclusividade de direitos. Um humano deve inspecionar a arte, corrigir anatomicamente e documentar condições de uso antes de publicá-la. **Licença definitiva de código/dados/mídia segue pendente na [Issue #39](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/39)**; não publicar com licença inventada.

## Design system — Atlas V3

| Parâmetro | Norma |
| --- | --- |
| Linguagem visual | SVG vetorial original, traçado limpo, contornos orgânicos, tons neutros para pele/dobok e destaque seletivo de regiões |
| Vistas | Corpo **anterior e posterior**; mãos **palma, dorso, punho**; pés **planta, dorso**; vistas adicionais apenas com caso de uso |
| Sistemas de coordenadas | Um `viewBox` fixo por família com landmarks verificáveis e paths independentes da escala CSS |
| Camadas | `silhouette` → `anatomical-guides` → `zones` → `outline` → `interactions`; IDs e z-index sem colisão |
| Identidade de zona | `slug` estável, `body_group`, `view`, `regionId`, `path`, `anchor`, `revision`; não misturar id do desenho e significado coreano |
| Cores | Região por grupo, contraste mínimo adequado e estado selecionado por cor **e** borda/indicador; foco de teclado visível |
| Layout | Responsivo; não cortar nome nem sobrepor o painel à geometria; preview com mouse não apaga seleção persistente |
| Acessibilidade | `aria-label` por região; suporte a teclado Enter/Space, touch e legendas equivalentes; alternativa textual de todas as zonas |
| Atribuição | Crédito visível `Ilustração original do Taekwondo para Todos` + link ao registro de autoria; isto não valida nome técnico |
| Revisão | Capture BEFORE/AFTER, geometria/superfície em contexto, status `draft`/ `reviewed`; nenhum desenho passa a ser `official` só por estar bonito |

## Construção

1. **Pesquisa:** estudar proporções anatômicas, regiões e terminologia a partir de fontes cuja consulta seja permitida. Não derivar paths pela vetorização direta de figura alheia. A referência original privada é um guia de localização, não a arte final.
2. **Composição:** desenhar formas independentes com curvas Bézier/primitive SVG criadas pela equipe. Escolher landmarks para ombros, cotovelos, quadril, joelhos, punhos e pés, compatíveis entre as vistas.
3. **Geometria:** distribuir zonas para evitar lacunas, hits invisíveis e áreas que saem do corpo. Não usar retângulos de conveniência para a cabeça/tronco/articulações; testar zonas pequenas de dedos e juntas por zoom.
4. **Tipos de região:** separar `illustrative_anatomy`, `technical_surface`, `target` e `contextual_use`. Uma zona pode apontar a vários termos sem que o próprio SVG receba Hangul.
5. **Publicação:** o arquivo de arte precisa de registro (abaixo), código auditado, testes visuais/touch e fonte anatômica quando afirmar um contorno ou região específica. Qualquer termo técnico associado exige **evidência por campo** distinta.

## Manifesto de autoria, um registro por asset

```json
{
  "asset_id": "body-front-v3",
  "file": "src/assets/atlas/body-front.svg",
  "status": "draft",
  "author_role": "Programations art production",
  "creation_method": "original svg drawing with manual review",
  "created_at": "YYYY-MM-DD",
  "source_references": [],
  "protected_reference_images_embedded": false,
  "svg_path_imported_from_third_party": false,
  "copyright_owner": "to_be_confirmed",
  "public_license": "undecided",
  "anatomical_review": "pending",
  "version": 1,
  "notes": "Descrição técnica atribuída somente às fontes citadas na ficha, não à arte."
}
```

A amostra **não é um asset existente** nem licença concedida. O agente deve preencher apenas metadados verdadeiros; se o autor ou a titularidade forem desconhecidos, registrar como pendente. Nunca adicionar logo/selo institucional sem autorização.

## Critérios de aceite por lote

- [ ] SVG com viewBox e paths originais, sem referências a binários/paths/copyright de terceiros.
- [ ] Frente e costas coerentes nos landmarks; legenda textual cobre 100% das zonas interativas.
- [ ] Testes de interseção, hitboxes, espelhamento, cobertura, foco e contraste em cada vista.
- [ ] Screenshots da silhueta completa e zonas críticas em 375px e >=1280px, sem título cortado.
- [ ] Comparação de localização anatômica por humano; diferenciar critério visual de homologação técnica.
- [ ] Manifesto com autor real/método/direitos; link no rodapé da ilustração.
- [ ] Nenhum rascunho técnico ou mídia não autorizada no build de produção.

## Divisão por agente

- **Antigravity**: lidera reconstrução e inspeção visual real, em worktree isolada (#41).
- **Codex**: garante tipos, preservação dos slugs, testes de SVG/interaction/snapshot e integração com o React, sem tocar nos mesmos arquivos simultaneamente.
- **Gemini**: compara localização/consistência do desenho com *descrições de fontes*, em revisão read-only; o modelo não decide se há plágio nem homologação.
- **Mantenedor/revisor**: aceite final da arte e da plausibilidade anatômica.

**Referências:** [Issue #41](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/41) · [Fontes técnicas](SOURCE_PROVENANCE.md) · [Licenças pendentes](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/39) · [Diretrizes de agente](AGENT_DISPATCH.md).
