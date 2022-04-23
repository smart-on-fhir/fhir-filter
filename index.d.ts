export type JSONScalar = string | number | boolean | null;
export type JSONArray  = JSONValue[];
export type JSONObject = { [ key: string ]: JSONValue };
export type JSONValue  = JSONScalar | JSONArray | JSONObject;
