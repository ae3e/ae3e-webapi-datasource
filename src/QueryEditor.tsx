import React, { PureComponent, ChangeEvent } from 'react';

import { DataSource } from './DataSource';
import { MyQuery, MyDataSourceOptions } from './types';

import { FormField } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

interface State {}

export class QueryEditor extends PureComponent<Props, State> {
  onQueryChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    console.log('Query change!');
    const { onChange, query } = this.props;
    const request = {
      ...query.request,
      query: JSON.parse(event.target.value),
    };
    onChange({ ...query, request });
  };

  onUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log('Url change!');
    const { onChange, query } = this.props;
    const request = {
      ...query.request,
      url: event.target.value,
    };
    onChange({ ...query, request });
  };

  render() {
    const { query } = this.props;
    let { request } = query;
    if (!request) {
      request = {
        query: '{ }',
        url: '',
      };
    }

    return (
      <div className="gf-form-group">
        <div className="gf-form">
          <FormField label="Url" labelWidth={6} onChange={this.onUrlChange} value={request.url} placeholder="http://" />
        </div>
        <div className="gf-form" style={{ display: 'block', width: '100%' }}>
          <h5>Query</h5>
          <textarea onBlur={this.onQueryChange} className="gf-form-input" rows={15}>
            {JSON.stringify(request.query, null, 2)}
          </textarea>
        </div>
      </div>
    );
  }
}
