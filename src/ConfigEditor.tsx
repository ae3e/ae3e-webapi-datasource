// Libraries
import React, { PureComponent, ChangeEvent } from 'react';

// Types
import { MyDataSourceOptions } from './types';

import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { FormField, FormLabel } from '@grafana/ui';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {
  state = {};

  componentDidMount() {}

  onURLChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      url: event.target.value,
      access: 'direct', // HARDCODE For now!
    });
  };

  onScriptChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      script: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  render() {
    const { options } = this.props;
    //const { jsonData } = options;

    return (
      <div className="gf-form-group">
        <div className="gf-form">
          <FormField
            label="URL"
            labelWidth={10}
            onChange={this.onURLChange}
            value={options.url}
            tooltip={'NOTE: hit directly via fetch, not proxy'}
            placeholder="GraphQL backend server URL"
          />
        </div>
        <div className="gf-form">
          <FormLabel className="width-10" tooltip="USed for Handlebars">
            Global function
          </FormLabel>
          <textarea onBlur={this.onScriptChange} className="gf-form-input" rows={15}>
            {options.jsonData.script}
          </textarea>
        </div>
      </div>
    );
  }
}
