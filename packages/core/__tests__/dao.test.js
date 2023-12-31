import { test, assert } from "vitest";
import {
  initialize,
  setDaoURI,
  daoURI,
  protocolVersion
} from "../src/dao.js";

test("initialize function", async () => {
  // Test the initialize function
  const daoAddress = "0xYourDAOAddress";
  const daoURIValue = "https://example.com/dao";
  const version = "v1";

  const result = initialize(daoAddress, daoURIValue, version);
  assert.equal(result, true);
});

test("setDaoURI function", async () => {
  // Test the setDaoURI function
  const daoURIValue = "https://example.com/new-dao-uri";
  const version = "v1";

  const result = await setDaoURI(daoURIValue, version);
  assert.equal(result, true);
});

test("daoURI function", async () => {
  // Test the daoURI function
  const version = "v1";
  const expectedDaoURI = "https://example.com/new-dao-uri";

  const result = await daoURI(version);
  assert.equal(result, expectedDaoURI);
});

test("protocolVersion function", async () => {
  // Test the protocolVersion function
  const result = await protocolVersion();
  assert.isNotNull(result);
  assert.isString(result);
});
