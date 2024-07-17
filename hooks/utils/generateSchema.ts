import { FunctionDeclarationSchemaType } from '@google/generative-ai';

type BasicSchemaPropertyType = 'string' | 'number' | 'boolean' | 'array' | 'object';

interface SchemaProperty {
  type: FunctionDeclarationSchemaType;
  description?: string;
  nullable: boolean;
  items?: {
    type: FunctionDeclarationSchemaType;
    properties?: Record<string, SchemaProperty>;
    required?: string[];
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
  properties: Record<
    string,
    BasicSchemaPropertyType | [BasicSchemaPropertyType, string?, boolean?, BasicSchemaPropertyType?] | [BasicSchemaPropertyType, string?, boolean?, Record<string, BasicSchemaPropertyType | [BasicSchemaPropertyType, string?, boolean?]>?]
  >
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
      schemaProperties[key] = {
        type: typeMap[prop],
        nullable: false,
      };
    } else {
      if (prop[0] === 'array') {
        const itemType = prop[3] ? typeMap[prop[3] as BasicSchemaPropertyType] : FunctionDeclarationSchemaType.STRING;
        schemaProperties[key] = {
          type: typeMap[prop[0]],
          description: prop[1],
          nullable: prop[2] ?? false,
          items: {
            type: itemType,
          },
        };
      } else if (prop[0] === 'object') {
        const objectProperties: Record<string, SchemaProperty> = {};
        const nestedProperties = prop[3];
        if (nestedProperties && typeof nestedProperties === 'object') {
          for (const nestedKey in nestedProperties) {
            const nestedProp = nestedProperties[nestedKey];
            if (typeof nestedProp === 'string') {
              objectProperties[nestedKey] = {
                type: typeMap[nestedProp],
                nullable: false,
              };
            } else {
              objectProperties[nestedKey] = {
                type: typeMap[nestedProp[0]],
                description: nestedProp[1],
                nullable: nestedProp[2] ?? false,
              };
            }
          }
        }
        schemaProperties[key] = {
          type: typeMap[prop[0]],
          description: prop[1],
          nullable: prop[2] ?? false,
          items: {
            type: FunctionDeclarationSchemaType.OBJECT,
            properties: objectProperties,
            required: Object.keys(objectProperties),
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

