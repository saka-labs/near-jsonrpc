import { TypeNode, SyntaxKind } from "ts-morph";
import {
  PrimitiveType,
  IdentifierType,
  ZodProperty,
  GeneratorContext,
} from "./types";
import {
  createZodPrimitive,
  createZodObject,
  createZodArray,
  createZodTuple,
  createZodUnion,
  createZodIntersection,
  createZodNull,
  createZodStringLiteral,
  createZodTypeReference,
  createZodDate,
  createZodRecord,
} from "./builders";

/**
 * Handles primitive type nodes (string, number, boolean, etc.)
 */
export function handlePrimitiveType(typeNode: TypeNode): string | null {
  const kindToType: Record<number, PrimitiveType> = {
    [SyntaxKind.StringKeyword]: PrimitiveType.String,
    [SyntaxKind.NumberKeyword]: PrimitiveType.Number,
    [SyntaxKind.BooleanKeyword]: PrimitiveType.Boolean,
    [SyntaxKind.AnyKeyword]: PrimitiveType.Any,
    [SyntaxKind.NeverKeyword]: PrimitiveType.Never,
    [SyntaxKind.UnknownKeyword]: PrimitiveType.Unknown,
  };

  const primitiveType = kindToType[typeNode.getKind()];
  return primitiveType ? createZodPrimitive(primitiveType) : null;
}

/**
 * Handles type reference nodes (Date, Record, custom types)
 */
export function handleTypeReference(
  typeNode: TypeNode,
  context: GeneratorContext
): string | null {
  if (!typeNode.isKind(SyntaxKind.TypeReference)) {
    return null;
  }

  const typeName = typeNode.getTypeName();
  if (!typeName.isKind(SyntaxKind.Identifier)) {
    return createZodPrimitive(PrimitiveType.Any);
  }

  const identifier = typeName.getText();

  // Handle built-in types
  if (identifier === IdentifierType.Date) {
    return createZodDate();
  }

  if (identifier === IdentifierType.Record) {
    return handleRecordType(typeNode, context);
  }

  // Handle custom schema references
  if (context.schemaSet.has(identifier + context.suffix)) {
    return createZodTypeReference(identifier + context.suffix, !context.dependencies.has(identifier + context.suffix));
  }

  return createZodPrimitive(PrimitiveType.Any);
}

/**
 * Handles Record<K, V> type references
 */
function handleRecordType(typeNode: TypeNode, context: GeneratorContext): string {
  if (!typeNode.isKind(SyntaxKind.TypeReference)) {
    throw new Error("Expected TypeReference for Record type");
  }

  const typeArguments = typeNode.getTypeArguments();
  if (typeArguments.length !== 2) {
    throw new Error("Record type must have exactly 2 type arguments");
  }

  const keyType = convertTypeNodeToZod(typeArguments[0]!, context);
  const valueType = convertTypeNodeToZod(
    typeArguments[1]!, context,
  );

  return createZodRecord(keyType, valueType);
}

/**
 * Handles type literal nodes (object types)
 */
export function handleTypeLiteral(
  typeNode: TypeNode,
  context: GeneratorContext
): string | null {
  if (!typeNode.isKind(SyntaxKind.TypeLiteral)) {
    return null;
  }

  const properties = typeNode.getProperties();

  // Handle empty object with index signature
  if (properties.length === 0) {
    const indexSignature = typeNode.getFirstChildByKind(
      SyntaxKind.IndexSignature
    );
    if (indexSignature) {
      const keyType = convertTypeNodeToZod(
        indexSignature.getKeyTypeNode(),
        context
      );
      const valueType = convertTypeNodeToZod(
        indexSignature.getReturnTypeNode(),
        context
      );
      return createZodRecord(keyType, valueType);
    }
    return createZodObject([]);
  }

  // Handle object properties
  const zodProperties: ZodProperty[] = properties.map((property) => ({
    name: property.getName(),
    zodType: convertTypeNodeToZod(
      property.getTypeNode(),
      context
    ),
    isOptional: property.hasQuestionToken(),
  }));

  return createZodObject(zodProperties);
}

/**
 * Handles array type nodes
 */
export function handleArrayType(
  typeNode: TypeNode,
  context: GeneratorContext
): string | null {
  if (!typeNode.isKind(SyntaxKind.ArrayType)) {
    return null;
  }

  const elementType = convertTypeNodeToZod(
    typeNode.getElementTypeNode(),
    context
  );
  return createZodArray(elementType);
}

/**
 * Handles tuple type nodes
 */
export function handleTupleType(
  typeNode: TypeNode,
  context: GeneratorContext
): string | null {
  if (!typeNode.isKind(SyntaxKind.TupleType)) {
    return null;
  }

  const elements = typeNode.getElements();
  const zodTypes = elements.map((element) =>
    convertTypeNodeToZod(element, context)
  );

  const tuple = createZodTuple(zodTypes);

  // zod v4's $ZodTuple reads item._zod.optin at construction time, which
  // forces z.lazy items immediately — before forward-referenced schemas are
  // declared. Defer construction of the whole tuple instead.
  if (zodTypes.some((zodType) => zodType.includes("z.lazy("))) {
    return `z.lazy(() => ${tuple})`;
  }

  return tuple;
}

/**
 * Handles union type nodes
 */
export function handleUnionType(
  typeNode: TypeNode,
  context: GeneratorContext
): string | null {
  if (!typeNode.isKind(SyntaxKind.UnionType)) {
    return null;
  }

  const nodes = typeNode.getTypeNodes();
  const zodTypes = nodes.map((node) =>
    convertTypeNodeToZod(node, context)
  );

  return createZodUnion(zodTypes);
}

/**
 * Handles intersection type nodes
 */
export function handleIntersectionType(
  typeNode: TypeNode,
  context: GeneratorContext
): string | null {
  if (!typeNode.isKind(SyntaxKind.IntersectionType)) {
    return null;
  }

  const nodes = typeNode.getTypeNodes();
  const zodTypes = nodes.map((node) =>
    convertTypeNodeToZod(node, context)
  );

  return createZodIntersection(zodTypes);
}

/**
 * Handles parenthesized type nodes
 */
export function handleParenthesizedType(
  typeNode: TypeNode,
  context: GeneratorContext
): string | null {
  if (!typeNode.isKind(SyntaxKind.ParenthesizedType)) {
    return null;
  }

  return convertTypeNodeToZod(
    typeNode.getTypeNode(),
    context
  );
}

/**
 * Handles literal type nodes (null, string literals)
 */
export function handleLiteralType(typeNode: TypeNode): string | null {
  if (!typeNode.isKind(SyntaxKind.LiteralType)) {
    return null;
  }

  const literal = typeNode.getLiteral();

  if (literal.getKind() === SyntaxKind.NullKeyword) {
    return createZodNull();
  }

  if (literal.getKind() === SyntaxKind.StringLiteral) {
    return createZodStringLiteral(literal.getText());
  }

  throw new Error(`Unsupported literal type: ${literal.getKindName()}`);
}

/**
 * Main function to convert TypeNode to Zod schema string
 */
export function convertTypeNodeToZod(
  typeNode: TypeNode | undefined,
  context: GeneratorContext
): string {
  if (!typeNode) {
    return createZodPrimitive(PrimitiveType.Unknown);
  }

  // Try each handler in order
  const handlers = [
    handlePrimitiveType,
    (node: TypeNode) => handleTypeReference(node, context),
    (node: TypeNode) => handleTypeLiteral(node, context),
    (node: TypeNode) => handleArrayType(node, context),
    (node: TypeNode) => handleTupleType(node, context),
    (node: TypeNode) => handleUnionType(node, context),
    (node: TypeNode) => handleIntersectionType(node, context),
    (node: TypeNode) => handleParenthesizedType(node, context),
    handleLiteralType,
  ];

  for (const handler of handlers) {
    const result = handler(typeNode);
    if (result !== null) {
      return result;
    }
  }

  throw new Error(`Unsupported type: ${typeNode.getKindName()}`);
}
