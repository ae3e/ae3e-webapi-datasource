import React, { PureComponent, ChangeEvent } from 'react';

import { DataSource } from './DataSource';
import { MyQuery, MyDataSourceOptions } from './types';

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
    const { onChange, query } = this.props;
    const request = {
      ...query.request,
      url: event.target.value,
    };
    onChange({ ...query, request });
  };

  onMethodChange = (value: any) => {
    console.log('Method change!');
    const { onChange, query } = this.props;
    const request = {
      ...query.request,
      method: value.value,
    };
    onChange({ ...query, request });
  };

  onHeadersChange = (evt: any, editor? : any) => {
    console.log('Headers change!');
    const { onChange, query } = this.props;
    const request = {
      ...query.request,
      headers: editor.getValue(),
    };
    onChange({ ...query, request });
  };

  onBodyChange = (evt: any, editor? : any) => {
    console.log('Query change!');
    const { onChange, query } = this.props;
    const request = {
      ...query.request,
      body: editor.getValue(),
    };
    onChange({ ...query, request });
  }; 

  onScriptChange = (evt: any, editor? : any) => {
    console.log('Script change!');
    const { onChange, query } = this.props;
    const request = {
      ...query.request,
      script: editor.getValue(),
    };
    onChange({ ...query, request });
  };

  render() {
    let theme = config.theme.isDark?"tomorrow_night":"tomorrow";
    console.log(config.theme.isDark);
    const { query } = this.props;
    let { request } = query;
    if (!request) {
      request = {
        body: '',
        headers:'',
        url: '',
        method:'',
        script:''
      };
    }

    return (
      <div>
        <div style={{ width: '100%' }}>
          <Field label="Url">
            <Input css="" onChange={this.onUrlChange} value={request.url} placeholder="http://"/>
          </Field>
        </div>
        <div style={{ width: '100%' }}>
          <Label className="width-12" description="Choose an HTTP method.">
            Method
          </Label>
          <Select
            value={request.method?{label:request.method,value:request.method}:{label:'GET',value:'GET'}}
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
            value={request.headers}
            onBlur={this.onHeadersChange}
          />
        </div>
        <br/>
        {request.method==='POST' && <div className="gf-form">
         <Label className="width-12" description="Set body of HTTP request">
            Body
          </Label>
        </div>}
        {request.method==='POST' && <div style={{ width: '100%' }}>
          <AceEditor
            mode="javascript"
            theme={theme}
            name="dashboard_script"
            height="300px"
            width="100%"
            value= {request.body}
            onBlur={this.onBodyChange}
          />
        </div>}
        {request.method==='POST' && <br/>}
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
            value={request.script}
            onBlur={this.onScriptChange}
          />
        </div>
      </div>
    );
  }
}
