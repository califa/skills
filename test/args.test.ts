import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseCliArgs } from "../src/args.js";

describe("CLI arguments", () => {
  it("accepts ui.sh-style positional skill names", () => {
    const options = parseCliArgs(["review", "release"]);
    assert.deepEqual(options.skillNames, ["review", "release"]);
    assert.equal(options.all, false);
  });

  it("accepts an explicit install-all mode", () => {
    const options = parseCliArgs(["--all"]);
    assert.equal(options.all, true);
    assert.equal(options.skillNames, undefined);
  });

  it("rejects mixing named skills with install-all", () => {
    assert.throws(
      () => parseCliArgs(["review", "--all"]),
      /either --all or specific skill names/,
    );
  });
});
