// Libraries
import React, { PureComponent, ChangeEvent } from 'react';

// Types
import { MyDataSourceOptions } from './types';

import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { Label } from '@grafana/ui';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {
  state = {};

  componentDidMount() {}

  /*onURLChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      url: event.target.value,
      access: 'direct', // HARDCODE For now!
    });
  };*/

  onScriptChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      script: event.target.value,
    };
    onOptionsChange({...options, jsonData });
  };

  render() {
    const { options } = this.props;
    //const { jsonData } = options;

    return (
      <div>
        <Label className="width-10" description="Used by Handlebars">
            Global function
          </Label>
          <textarea onBlur={this.onScriptChange} className="gf-form-input" rows={15}>
            {options.jsonData.script}
          </textarea>
      </div>
    );
  }
}
