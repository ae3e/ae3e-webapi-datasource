import { DataSourcePlugin } from '@grafana/data';

import { DataSource } from './DataSource';
import { QueryEditor } from './QueryEditor';
import { ConfigEditor } from './ConfigEditor';
import { MyQuery, MyDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<DataSource, MyQuery, MyDataSourceOptions>(DataSource)
  .setConfigEditor(ConfigEditor)
  //.setVariableQueryEditor
  .setQueryEditor(QueryEditor);
