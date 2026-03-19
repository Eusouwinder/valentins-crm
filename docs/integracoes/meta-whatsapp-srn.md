# Integração Meta Ads + WhatsApp + SRN

## Objetivo

Implementar no SRN um fluxo completo de rastreamento e atribuição de leads e vendas, integrando:

- Meta Ads
- WhatsApp
- Evolution API
- SRN como sistema central
- Meta Conversions API

O sistema deve:

1. identificar conversas iniciadas a partir de anúncios da Meta;
2. criar ou atualizar o lead automaticamente no SRN;
3. manter o vínculo da origem durante todo o funil;
4. registrar a venda com valor e data;
5. devolver a conversão para a Meta para melhorar a otimização das campanhas.

---

## Arquitetura proposta

### Componentes

- **Meta Ads**: origem do clique e da conversa;
- **WhatsApp**: canal de atendimento;
- **Evolution API**: ponte de webhook/eventos entre WhatsApp e SRN;
- **SRN**: hub de rastreamento, funil, atendimento e vendas;
- **Meta Conversions API**: recebimento server-side do evento de conversão.

### Fluxo de alto nível

1. Usuário visualiza anúncio da Meta.
2. Usuário clica no anúncio e inicia conversa no WhatsApp.
3. Evolution API recebe o evento e envia webhook ao SRN.
4. SRN cria ou atualiza o lead com os metadados de origem.
5. Atendimento evolui no funil comercial.
6. Venda é marcada no SRN.
7. SRN envia o evento de conversão para a Meta via Conversions API.

---

## Requisitos funcionais

### 1. Captura de origem

O SRN deve registrar automaticamente, quando disponíveis:

- `source` (`facebook`, `instagram`, `whatsapp`)
- `medium` (`paid`, `organic`)
- `campaign_id`
- `campaign_name`
- `adset_id`
- `adset_name`
- `ad_id`
- `ad_name`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `fbclid`
- `landing_url`
- `first_touch_at`

### 2. Integração com WhatsApp via Evolution API

O webhook da Evolution deve entregar ao SRN, no mínimo:

- telefone do contato;
- nome do contato, quando houver;
- identificador da conversa;
- primeira mensagem;
- data e hora do evento;
- direção e tipo do evento;
- instância/canal de origem.

### 3. Criação e atualização de lead

Regra principal:

- a chave de deduplicação deve ser o **telefone normalizado**;
- se o telefone já existir, o lead deve ser atualizado;
- se não existir, o lead deve ser criado automaticamente.

### 4. Pipeline comercial

O SRN deve permitir acompanhar o lead em etapas como:

- Novo lead
- Em atendimento
- Qualificado
- Proposta enviada
- Negociação
- Venda fechada
- Perdido

### 5. Registro da venda

Ao fechar a venda, o SRN deve persistir:

- identificador do lead;
- valor da venda;
- moeda;
- produto ou serviço vendido;
- data e hora da conversão;
- responsável pelo fechamento;
- origem original do lead;
- dados de campanha vinculados ao lead.

### 6. Devolução de conversão para a Meta

O SRN deve enviar server-side para a Meta:

- `event_name` (ex.: `Purchase`)
- `event_time`
- `action_source` (`system_generated` ou equivalente definido na implementação)
- `event_source_url` quando existir
- `user_data` com identificadores compatíveis
- `custom_data` com valor, moeda e dados comerciais

Também deve haver:

- fila ou retry para falha temporária;
- log de envio e resposta da Meta;
- mecanismo de deduplicação quando necessário.

---

## Estrutura sugerida no projeto

```text
app/
  api/
    webhooks/
      evolution/
        route.ts
    conversions/
      meta/
        route.ts
lib/
  tracking/
    normalize-phone.ts
    attribution.ts
    meta-conversions.ts
    evolution-webhook.ts
docs/
  integracoes/
    meta-whatsapp-srn.md
```

---

## Endpoints sugeridos

### `POST /api/webhooks/evolution`

Responsável por:

- validar assinatura/token da Evolution, se configurado;
- normalizar payload;
- localizar lead por telefone;
- criar ou atualizar lead;
- registrar evento e histórico da conversa;
- anexar origem e metadados quando disponíveis.

### `POST /api/conversions/meta`

Responsável por:

- receber evento interno de conversão do SRN;
- validar payload mínimo;
- montar payload da Meta Conversions API;
- enviar evento à Meta;
- persistir log de sucesso/erro.

---

## Modelo mínimo de dados

### Lead

- `id`
- `name`
- `phone`
- `normalized_phone`
- `source`
- `medium`
- `campaign_id`
- `campaign_name`
- `adset_id`
- `adset_name`
- `ad_id`
- `ad_name`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `fbclid`
- `first_touch_at`
- `stage`
- `owner_id`

### Conversation event

- `id`
- `lead_id`
- `provider`
- `conversation_id`
- `event_type`
- `message_preview`
- `payload_raw`
- `created_at`

### Conversion event

- `id`
- `lead_id`
- `event_name`
- `value`
- `currency`
- `product_name`
- `occurred_at`
- `meta_status`
- `meta_response_raw`

---

## Variáveis de ambiente sugeridas

Adicionar ao `.env.example` em etapa seguinte:

```env
# Evolution API
EVOLUTION_API_URL=
EVOLUTION_API_KEY=
EVOLUTION_INSTANCE=
EVOLUTION_WEBHOOK_SECRET=

# Meta Ads / Conversions API
META_PIXEL_ID=
META_ACCESS_TOKEN=
META_TEST_EVENT_CODE=
META_API_VERSION=v22.0
```

---

## Requisitos não funcionais

- deduplicação confiável por telefone;
- logs auditáveis de entrada e saída;
- tratamento de falhas com retry;
- proteção de segredos e conformidade básica com LGPD;
- arquitetura preparada para expansão futura.

---

## Critérios de aceite

### Fase 1

- webhook da Evolution recebido com sucesso;
- lead criado ou atualizado por telefone;
- histórico da conversa salvo no SRN;
- origem do lead persistida quando houver metadados.

### Fase 2

- venda registrada no SRN;
- evento `Purchase` enviado para a Meta;
- resposta da Meta salva em log;
- erro de envio tratável com retry.

### Fase 3

- dashboards por campanha;
- relatórios de leads, conversas e vendas;
- análise de taxa de conversão por origem.

---

## Observações importantes

1. Integrar apenas o WhatsApp sem capturar origem não resolve o problema.
2. Integrar apenas a origem sem devolver a venda para a Meta também deixa o sistema incompleto.
3. O valor do projeto está no ciclo completo: **anúncio -> conversa -> lead -> venda -> conversão devolvida para a Meta**.

---

## Resumo executivo

O SRN deve funcionar como hub central de rastreamento, atendimento e atribuição de conversão, integrando Meta Ads + WhatsApp via Evolution API + devolução server-side para a Meta Conversions API.