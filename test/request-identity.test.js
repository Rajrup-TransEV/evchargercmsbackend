import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import {
  resolveAuthenticatedUser,
  resolveTransactionUser,
} from "../lib/charging/request-identity.js";

test("authenticated user identity is derived from the bearer token", () => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "test-only-secret";
  try {
    const token = jwt.sign({ userid: "passenger-1" }, process.env.JWT_SECRET);
    const accepted = resolveAuthenticatedUser({
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(accepted.ok, true);
    assert.equal(accepted.userid, "passenger-1");

    assert.equal(resolveAuthenticatedUser({ headers: {} }).status, 401);
    const invalid = resolveAuthenticatedUser({
      headers: { authorization: `Bearer ${jwt.sign({}, process.env.JWT_SECRET)}` },
    });
    assert.equal(invalid.status, 401);
  } finally {
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});

test("authenticated transaction access must match JWT userid", () => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "test-only-secret";
  try {
    const token = jwt.sign({ userid: "passenger-1" }, process.env.JWT_SECRET);
    const accepted = resolveTransactionUser(
      { headers: { authorization: `Bearer ${token}` } },
      "passenger-1"
    );
    assert.equal(accepted.ok, true);
    assert.equal(accepted.source, "bearer");

    const rejected = resolveTransactionUser(
      { headers: { authorization: `Bearer ${token}` } },
      "passenger-2"
    );
    assert.equal(rejected.ok, false);
    assert.equal(rejected.status, 403);
  } finally {
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});

test("legacy body identity is explicit and can be disabled", () => {
  const previous = process.env.ALLOW_LEGACY_TRANSACTION_IDENTITY;
  try {
    process.env.ALLOW_LEGACY_TRANSACTION_IDENTITY = "true";
    assert.equal(
      resolveTransactionUser({ headers: {} }, "passenger-1").source,
      "legacy_body"
    );
    process.env.ALLOW_LEGACY_TRANSACTION_IDENTITY = "false";
    assert.equal(
      resolveTransactionUser({ headers: {} }, "passenger-1").status,
      401
    );
  } finally {
    if (previous === undefined) delete process.env.ALLOW_LEGACY_TRANSACTION_IDENTITY;
    else process.env.ALLOW_LEGACY_TRANSACTION_IDENTITY = previous;
  }
});
