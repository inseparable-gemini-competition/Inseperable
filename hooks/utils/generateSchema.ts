import { FunctionDeclarationSchemaType } from '@google/generative-ai';

type BasicSchemaPropertyType = 'string' | 'number' | 'boolean' | 'array' | 'object';

interface SchemaProperty {
  type: FunctionDeclarationSchemaType;
  description?: string;
  nullable: boolean;
  items?: {
    type: FunctionDeclarationSchemaType;
    properties: Record<string, SchemaProperty>;
    required: string[];
  };
}

interface Schema {
  description: string;
  type: FunctionDeclarationSchemaType;
  items: {
    type: FunctionDeclarationSchemaType;
    properties: Record<string, SchemaProperty>;
    required: string[];
  };
}

export const generateSchema = (
  description: string,
  properties: Record<string, BasicSchemaPropertyType | [BasicSchemaPropertyType, string?, boolean?]>
): Schema => {
  const typeMap: Record<BasicSchemaPropertyType, FunctionDeclarationSchemaType> = {
    string: FunctionDeclarationSchemaType.STRING,
    number: FunctionDeclarationSchemaType.NUMBER,
    boolean: FunctionDeclarationSchemaType.BOOLEAN,
    array: FunctionDeclarationSchemaType.ARRAY,
    object: FunctionDeclarationSchemaType.OBJECT,
  };

  const schemaProperties: Record<string, SchemaProperty> = {};
  const required: string[] = [];

  for (const key in properties) {
    const prop = properties[key];
    if (typeof prop === 'string') {
      if (prop === 'array') {
        throw new Error(`Array type for ${key} must specify items, type, and properties.`);
      }
      schemaProperties[key] = {
        type: typeMap[prop],
        nullable: false,
      };
    } else {
      if (prop[0] === 'array') {
        // Define properties for items if array type is encountered
        const itemProperties: Record<string, SchemaProperty> = {
          // Example of defining item properties, adjust as needed
          exampleItem: { type: FunctionDeclarationSchemaType.STRING, nullable: false },
        };
        schemaProperties[key] = {
          type: typeMap[prop[0]],
          description: prop[1],
          nullable: prop[2] ?? false,
          items: {
            type: FunctionDeclarationSchemaType.OBJECT,
            properties: itemProperties,
            required: Object.keys(itemProperties),
          },
        };
      } else {
        schemaProperties[key] = {
          type: typeMap[prop[0]],
          description: prop[1],
          nullable: prop[2] ?? false,
        };
      }
    }
    required.push(key);
  }

  return {
    description: description,
    type: FunctionDeclarationSchemaType.ARRAY,
    items: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: schemaProperties,
      required: required,
    },
  };
};
