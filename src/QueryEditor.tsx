import React, { PureComponent, ChangeEvent } from 'react';

import defaults from 'lodash/defaults';

import { DataSource } from './DataSource';
import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';

import { Field, Label, Input, Select } from '@grafana/ui';
import {config} from '@grafana/runtime'
import { QueryEditorProps } from '@grafana/data';

import AceEditor from 'react-ace';

import 'brace/mode/javascript';
import 'brace/theme/tomorrow';
import 'brace/theme/tomorrow_night';
import 'brace/theme/github';

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

  onHeadersChange = (evt: any, editor? : any) => {
    console.log('Headers change!');
    const { onChange, query } = this.props;
    onChange({ ...query, headers: editor.getValue() });
  };

  onBodyChange = (evt: any, editor? : any) => {
    console.log('Query change!');
    const { onChange, query } = this.props;
    onChange({ ...query, body: editor.getValue() });
  }; 

  onScriptChange = (evt: any, editor? : any) => {
    console.log('Script change!');
    const { onChange, query } = this.props;
    onChange({ ...query, script: editor.getValue() });
  };

  render() {
    let theme = config.theme.isDark?"tomorrow_night":"tomorrow";
    console.log(config.theme.isDark);
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
          <AceEditor
            mode="javascript"
            theme={theme}
            name="dashboard_script"
            height="150px"
            width="100%"
            value={headers}
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
          <AceEditor
            mode="javascript"
            theme={theme}
            name="dashboard_script"
            height="300px"
            width="100%"
            value= {body}
            onBlur={this.onBodyChange}
          />
        </div>}
        {method==='POST' && <br/>}
        <div style={{ width: '100%'}}>
          <Label description="Set script to return formatted data as described in Grafana's documentation">
            Script
          </Label>
          <AceEditor
            mode="javascript"
            theme={theme}
            name="dashboard_script"
            height="300px"
            width="100%"
            value={script}
            onBlur={this.onScriptChange}
          />
        </div>
      </div>
    );
  }
}
