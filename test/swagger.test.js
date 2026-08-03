import test from "node:test";
import assert from "node:assert/strict";
import { setupSwagger, swaggerSpec } from "../swagger.js";

test("OpenAPI includes the app-user money transaction endpoint", () => {
  const operation = swaggerSpec.paths?.["/users/moneytransactionhistory"]?.get;
  assert.equal(operation?.operationId, "getAppUserMoneyTransactionHistory");
  assert.deepEqual(operation?.security, [{ bearerAuth: [] }]);

  const bill = swaggerSpec.components?.schemas?.BillSummary;
  assert.ok(bill?.properties?.customer);
  assert.ok(bill?.properties?.issuer);
  assert.ok(bill?.properties?.charger);
  assert.ok(bill?.properties?.charging);
  assert.ok(bill?.properties?.payment);
  assert.ok(bill?.properties?.amounts);
  assert.equal(bill?.properties?.billing_pdf, undefined);
});

test("API docs routes honor API_DOCS_ENABLED", () => {
  const previous = process.env.API_DOCS_ENABLED;
  try {
    const registered = [];
    const app = {
      get: (path) => registered.push(["get", path]),
      use: (path) => registered.push(["use", path]),
    };

    process.env.API_DOCS_ENABLED = "false";
    setupSwagger(app);
    assert.deepEqual(registered, []);

    process.env.API_DOCS_ENABLED = "true";
    setupSwagger(app);
    assert.deepEqual(registered, [
      ["get", "/openapi.json"],
      ["use", "/swagger"],
    ]);
  } finally {
    if (previous === undefined) delete process.env.API_DOCS_ENABLED;
    else process.env.API_DOCS_ENABLED = previous;
  }
});
