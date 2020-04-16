// Types
import { DataQueryRequest, DataQueryResponse, DataSourceApi, DataSourceInstanceSettings } from '@grafana/data';
import { MyQuery, MyDataSourceOptions } from './types';

import truncate from 'lodash/truncate';
import Handlebars from 'handlebars';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  /** @ngInject */
  constructor(private instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>, private templateSrv: any) {
    super(instanceSettings);
  }

  getQueryDisplayText(query: MyQuery) {
    if (!query.request || !query.request.body) {
      return 'Missing Query';
    }
    return truncate(query.request.body, { length: 20 });
  }

  query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    return this.doAllQueries(options).then(data => {
      console.log(data);
      return data;
    });
  }

  async doAllQueries(options: any): Promise<DataQueryResponse> {
    //console.log(options);

    //If global script for Handlebars exists
    if (this.instanceSettings.jsonData.script && this.instanceSettings.jsonData.script != '') {
      let func = new Function('text,options', this.instanceSettings.jsonData.script) as any;

      Handlebars.registerHelper('function', (text, opts) => {
        let result = func(text, opts);
        return result;
      });
    }

    const context = {
      interval: this.templateSrv.replace('$__interval', options.scopedVars),
    } as any;
    this.templateSrv.variables.forEach((elt: any) => {
      context[elt.name] = elt.current.text;
    })

    function replaceVariables(ctxt: any, value: string) {
      const template = Handlebars.compile(value);
      let res = template(context);
      res = ctxt.templateSrv.replace(res, options.scopedVars);
      return res;
    }

    var promises: any = options.targets.map(async (target: any) => {

      const opts = {
        method: target.request.method,
      } as any;

      if (target.request.headers) {
        opts.headers = JSON.parse(target.request.headers)
      }
      if (target.request.method === 'POST') {
        opts.body = replaceVariables(this, target.request.body);
      }

      let url = replaceVariables(this, target.request.url);

      const res = await fetch(url, opts);
      const json = await res.json();

      let processed: any[] = [];

      try {
        if (target.request.script && target.request.script !== '') {
          var f = new Function('data,variables', target.request.script);
          processed = f(json);
        } else {
          processed = json;
        }
      } catch (e) {
        console.log(e);
      }

      return processed;
    })

    let results = await Promise.all(promises)
    let data = results.map((elt: any) => elt[0]);
    //console.log(data);

    //data===[undefined]. I don't know when it happens but sometimes it happens... so here is a fix
    if (data.length == 1 && data[0] === undefined) data = []


    return { data };
  }

  testDatasource() {
    const url = this.instanceSettings.url;
    if (!url) {
      return Promise.resolve({
        status: 'warn',
        message: 'Missing URL',
      });
    }

    return fetch(url, {
      method: 'GET',
    }).then((response: any) => {
      console.log('RESPONSE', response);
      return {
        status: 'success',
        message: 'OK',
      };
    });
  }
}