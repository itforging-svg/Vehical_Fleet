import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const files = [
  "src/pages/LoginPage.tsx",
  "src/pages/RequestVehicle.tsx",
  "src/components/FileUpload.tsx",
];

test("sampled form labels are associated with controls", () => {
  for (const file of files) {
    const source = ts.createSourceFile(
      file,
      readFileSync(new URL(`../${file}`, import.meta.url), "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const labels = [];
    const ids = new Set();
    const refs = new Set();

    function visit(node) {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const attrs = node.attributes.properties.filter(ts.isJsxAttribute);
        const getString = (name) => attrs.find(a => a.name.getText() === name)?.initializer;
        const getValue = (name) => {
          const value = getString(name);
          return value && ts.isStringLiteral(value) ? value.text : undefined;
        };
        if (node.tagName.getText() === "label") {
          const value = getString("htmlFor");
          labels.push(value && ts.isJsxExpression(value) ? value.expression.getText(source) : getValue("htmlFor"));
        }
        if (["input", "select", "textarea"].includes(node.tagName.getText())) {
          const value = getString("id");
          const id = value && ts.isJsxExpression(value) ? value.expression.getText(source) : getValue("id");
          if (id) ids.add(id);
        }
      }
      ts.forEachChild(node, visit);
    }

    visit(source);
    assert.ok(labels.length > 0, `${file} has no labels to check`);
    for (const label of labels) {
      assert.ok(label && (ids.has(label) || (file.endsWith("FileUpload.tsx") && label === "fileInputId")), `${file} has an unassociated label`);
    }
  }
});

test("login page does not claim unimplemented access monitoring", () => {
  const loginPage = readFileSync(new URL("../src/pages/LoginPage.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(loginPage, /access attempts are digitally logged and monitored/i);
});
