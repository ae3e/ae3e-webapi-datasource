/*import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface GraphQL {
  query: string;
  variables?: any;
}

export interface MyQuery extends DataQuery {
  request: GraphQL;
  jsonata?: string;
}


export interface MyDataSourceOptions extends DataSourceJsonData {
  authHeader?: string;
}*/

import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface WebQuery {
  query: string;
  url: string;
  method: string;
  script: string;
  variables?: any;
}

export interface MyQuery extends DataQuery {
  request: WebQuery;
  jsonata?: string;
}

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  script?: string;
  authHeader?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
  apiKey?: string;
}
