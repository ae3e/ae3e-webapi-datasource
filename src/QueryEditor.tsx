import React, { PureComponent, ChangeEvent } from 'react';

import defaults from 'lodash/defaults';

import { DataSource } from './DataSource';
import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';

import { Field, Label, Input, Select,CodeEditor } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';


type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

interface State {}

export class QueryEditor extends PureComponent<Props, State> {
  onUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log('Url change!');
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, url: event.target.value });
    onRunQuery();
  };

  onMethodChange = (value: any) => {
    console.log('Method change!');
    const { onChange, query } = this.props;
    onChange({ ...query, method: value.value });
  };

  onHeadersChange = (headers:string) => {
    console.log('Headers change!');
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, headers: headers });
    onRunQuery();
  };

  onBodyChange = (body :string) => {
    console.log('Query change!');
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, body: body });
    onRunQuery();
  }; 

  onScriptChange = (script : string) => {
    console.log('Script change!');
    console.log(script)
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, script: script });
    onRunQuery();
  };

  render() {
    //const theme = useTheme();

    //const { query } = this.props;
    const query = defaults(this.props.query, defaultQuery);
    let { url,body,headers,method,script } = query;

    return (
      <div>
        <div style={{ width: '100%' }}>
          <Field label="Url">
            <Input css="" onChange={this.onUrlChange} value={url} placeholder="http://"/>
          </Field>
        </div>
        <div style={{ width: '100%' }}>
          <Label className="width-12" description="Choose an HTTP method.">
            Method
          </Label>
          <Select
            value={method?{label:method,value:method}:{label:'GET',value:'GET'}}
            placeholder="Choose..."
            options={[{ label: 'GET', value: 'GET' },
            { label: 'POST', value: 'POST' },
          ]}
            allowCustomValue={true}
            onChange={this.onMethodChange}
          />
        </div>
        <br/>
        <div style={{ width: '100%' }}>
          <Label className="width-12" description="Set headers of HTTP request">
            Headers
          </Label>

          <CodeEditor
            language="json"
            showLineNumbers={true}
            value={headers}
            width="100%"
            height="200px"
            onBlur={this.onHeadersChange}
          />

        </div>
        <br/>
        {method==='POST' && <div className="gf-form">
         <Label className="width-12" description="Set body of HTTP request">
            Body
          </Label>
        </div>}
        {method==='POST' && <div style={{ width: '100%' }}>
        <CodeEditor
            language="json"
            showLineNumbers={true}
            value={body}
            width="100%"
            height="200px"
            onBlur={this.onBodyChange}
          />
        </div>}
        {method==='POST' && <br/>}
        <div style={{ width: '100%'}}>
          <Label description="Set script to return formatted data as described in Grafana's documentation">
            Script
          </Label>
          <CodeEditor
            language="javascript"
            showLineNumbers={true}
            value={script}
            width="100%"
            height="200px"
            onBlur={this.onScriptChange}
          />
        </div>
      </div>
    );
  }
}
