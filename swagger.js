import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'TransEV Legacy CMS API',
    version: '1.0.0',
    description: 'Implemented HTTP contracts for the legacy EV charging CMS.',
  },
  servers: [
    {
      url: '/',
      description: 'Current server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        required: ['message'],
        properties: { message: { type: 'string' } },
      },
      ChargingSessionSummary: {
        type: 'object',
        nullable: true,
        properties: {
          session_id: { type: 'string' },
          charger_id: { type: 'string', nullable: true },
          started_at: { type: 'string', nullable: true },
          stopped_at: { type: 'string', nullable: true },
          meter_start_wh: { type: 'string', nullable: true },
          meter_stop_wh: { type: 'string', nullable: true },
          consumed_kwh: { type: 'string', nullable: true },
          total_cost: { type: 'string', nullable: true },
        },
      },
      BillSummary: {
        type: 'object',
        nullable: true,
        properties: {
          id: { type: 'string', nullable: true },
          source: {
            type: 'string',
            enum: ['USER_BILLING', 'DERIVED_FROM_TRANSACTION'],
          },
          title: { type: 'string', enum: ['Customer Bill'] },
          invoice_number: { type: 'string' },
          issued_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          currency: { type: 'string', enum: ['INR'] },
          customer: {
            type: 'object',
            properties: {
              id: { type: 'string', nullable: true },
              name: { type: 'string', nullable: true },
              email: { type: 'string', nullable: true },
              phone: { type: 'string', nullable: true },
              address: { type: 'string', nullable: true },
            },
          },
          issuer: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'string', nullable: true },
              name: { type: 'string', nullable: true },
              email: { type: 'string', nullable: true },
              phone: { type: 'string', nullable: true },
              address: { type: 'string', nullable: true },
              designation: { type: 'string', nullable: true },
              gstin: { type: 'string', nullable: true },
            },
          },
          charger: {
            type: 'object',
            properties: {
              id: { type: 'string', nullable: true },
              name: { type: 'string', nullable: true },
              serial_number: { type: 'string', nullable: true },
              address: { type: 'string', nullable: true },
              connector_type: { type: 'string', nullable: true },
              protocol: { type: 'string', nullable: true },
            },
          },
          charging: {
            type: 'object',
            properties: {
              session_id: { type: 'string', nullable: true },
              started_at: { type: 'string', nullable: true },
              stopped_at: { type: 'string', nullable: true },
              duration_ms: { type: 'string', nullable: true },
              meter_start_wh: { type: 'string', nullable: true },
              meter_stop_wh: { type: 'string', nullable: true },
              energy_consumed_kwh: { type: 'string', nullable: true },
            },
          },
          payment: {
            type: 'object',
            properties: {
              reference: { type: 'string', nullable: true },
              wallet_id: { type: 'string', nullable: true },
            },
          },
          amounts: {
            type: 'object',
            properties: {
              taxable: { type: 'string', nullable: true },
              gst: { type: 'string', nullable: true },
              total: { type: 'string', nullable: true },
              balance_deducted: { type: 'string', nullable: true },
              last_transaction: { type: 'string', nullable: true },
            },
          },
        },
      },
      MoneyTransactionEntry: {
        type: 'object',
        required: ['id', 'type', 'direction', 'currency', 'created_at'],
        properties: {
          id: { type: 'string' },
          type: { type: 'string', enum: ['WALLET_RECHARGE', 'CHARGING_DEBIT'] },
          direction: { type: 'string', enum: ['CREDIT', 'DEBIT'] },
          amount: { type: 'string', nullable: true, example: '125.50' },
          currency: { type: 'string', enum: ['INR'] },
          payment_id: { type: 'string', nullable: true },
          wallet_id: { type: 'string', nullable: true },
          charger_id: { type: 'string', nullable: true },
          taxable_amount: { type: 'string', nullable: true },
          gst_amount: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          charging_session: { $ref: '#/components/schemas/ChargingSessionSummary' },
          bill: { $ref: '#/components/schemas/BillSummary' },
        },
      },
      AppUserMoneyHistoryResponse: {
        type: 'object',
        required: ['message', 'data', 'pagination', 'filter'],
        properties: {
          message: { type: 'string' },
          wallet: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'string', nullable: true },
              current_balance: { type: 'string', nullable: true },
              currency: { type: 'string', enum: ['INR'] },
            },
          },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/MoneyTransactionEntry' },
          },
          pagination: {
            type: 'object',
            required: ['page', 'limit', 'total', 'total_pages', 'has_previous', 'has_next'],
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' },
              total: { type: 'integer' },
              total_pages: { type: 'integer' },
              has_previous: { type: 'boolean' },
              has_next: { type: 'boolean' },
            },
          },
          filter: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['all', 'wallet_recharge', 'charging_debit'] },
            },
          },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ['./androidpac/routes/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);

function apiDocsEnabled() {
  const value = String(process.env.API_DOCS_ENABLED ?? 'true').trim().toLowerCase();
  return ['true', '1', 'yes', 'on'].includes(value);
}

export function setupSwagger(app) {
  if (!apiDocsEnabled()) return;

  app.get('/openapi.json', (_req, res) => res.json(swaggerSpec));
  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
