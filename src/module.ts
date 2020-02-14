import { DataSourcePlugin } from '@grafana/data';

import { DataSource } from './DataSource';
import { QueryEditor } from './QueryEditor';
//import { GraphQLConfigEditor } from './GraphQLConfigEditor';
import { MyQuery, MyDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<DataSource, MyQuery, MyDataSourceOptions>(DataSource)
  //.setConfigEditor(GraphQLConfigEditor)
  //.setVariableQueryEditor
  .setQueryEditor(QueryEditor);
