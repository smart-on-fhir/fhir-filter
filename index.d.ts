declare function fhirFilter(item: JSONObject, index?: number, all?: JSONObject[]): JSONObject[]

declare namespace fhirFilter {    
    export const create: (filter: string) => ((item: JSONObject, index?: number, all?: JSONObject[]) => JSONObject[]);
}

export type JSONScalar = string | number | boolean | null;
export type JSONArray  = JSONValue[];
export type JSONObject = { [ key: string ]: JSONValue };
export type JSONValue  = JSONScalar | JSONArray | JSONObject;

export = fhirFilter;