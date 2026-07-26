import { PropertySignature, SourceFile, SyntaxKind } from "ts-morph";
import type { SchemaType } from "../types";
import { snakeToCamel } from "../utils";
import { getSchemasLiteral, replaceAllIndexedSchemas } from "./utils";

/**
 * Processes property renaming for snake_case to camelCase conversion
 * This is optimized to batch rename operations for better performance
 */
function processPropertyRenaming(
  propertyDescendants: PropertySignature[],
  propertyName: string,
  mappedSnakeCamelProperty: Map<string, string>
) {
  const renameOperations: Array<{
    property: PropertySignature;
    newName: string;
  }> = [];

  // Collection phase: gather all rename operations
  for (const property of propertyDescendants) {
    const name = property.getName();
    const camelize = snakeToCamel(name);
    if (name !== camelize) {
      mappedSnakeCamelProperty.set(name, camelize);
      renameOperations.push({ property, newName: camelize });
    }
  }

  // Rename the properties
  // TODO: use batch rename for better performance
  for (const { property, newName } of renameOperations) {
    property.rename(newName);
  }

  return mappedSnakeCamelProperty;
}

/**
 * Removes `unknown` members from union types.
 * An empty schema `{}` in the spec's anyOf (e.g. RpcTransactionResponse)
 * is emitted by openapi-typescript as `unknown`, which collapses the whole
 * union (`A | B | unknown` = `unknown`) and breaks discriminator narrowing
 * and the generated Zod schemas.
 */
function stripUnknownFromUnions(property: PropertySignature) {
  let changed = true;
  while (changed) {
    changed = false;
    const typeNode = property.getTypeNodeOrThrow();
    const unions = typeNode.isKind(SyntaxKind.UnionType)
      ? [typeNode, ...typeNode.getDescendantsOfKind(SyntaxKind.UnionType)]
      : typeNode.getDescendantsOfKind(SyntaxKind.UnionType);

    for (const union of unions) {
      const members = union.getTypeNodes();
      const kept = members.filter(
        (m) => m.getKind() !== SyntaxKind.UnknownKeyword
      );
      if (kept.length > 0 && kept.length < members.length) {
        union.replaceWithText(kept.map((m) => m.getText()).join(" | "));
        // replaceWithText invalidates descendant nodes, restart the scan
        changed = true;
        break;
      }
    }
  }
}

/**
 * Processes a single schema property and returns its schema type
 */
function processSchemaProperty(
  property: PropertySignature,
  mappedSnakeCamelProperty: Map<string, string>
) {
  stripUnknownFromUnions(property);

  const propertyDescendants = property.getDescendantsOfKind(
    SyntaxKind.PropertySignature
  );

  if (propertyDescendants.length > 0) {
    processPropertyRenaming(
      propertyDescendants,
      property.getName(),
      mappedSnakeCamelProperty
    );
  }

  const typeName = property.getName();
  const typeNode = property.getTypeNodeOrThrow();

  const schemaType: SchemaType = {
    schema: typeName,
    type: replaceAllIndexedSchemas(typeNode.getText()),
  };

  return schemaType;
}

/**
 * Main function to parse schema types from OpenAPI TypeScript source
 * This function extracts schema types and handles snake_case to camelCase conversion
 */
export function parseSchemaTypes(
  source: SourceFile,
  ignoreSchemaSet: Set<string>
) {
  const schemaLiteral = getSchemasLiteral(source);
  const propertySignatures = schemaLiteral.getChildrenOfKind(
    SyntaxKind.PropertySignature
  );

  const mappedSnakeCamelProperty = new Map<string, string>();
  const schemaTypes: SchemaType[] = [];

  for (const property of propertySignatures) {
    if (ignoreSchemaSet.has(property.getName())) {
      continue;
    }

    const schemaType = processSchemaProperty(
      property,
      mappedSnakeCamelProperty
    );
    schemaTypes.push(schemaType);
  }

  return {
    schemaTypes,
    mappedSnakeCamelProperty,
  };
}
