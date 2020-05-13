// Types
import { DataQueryRequest, DataQueryResponse, DataSourceApi, DataSourceInstanceSettings/*, MutableDataFrame */} from '@grafana/data';
import { MyQuery, MyDataSourceOptions } from './types';

import { SystemJS } from '@grafana/runtime'
//import { getBackendSrv } from '@grafana/runtime'

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

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    let data = await this.doAllQueries(options);
    console.log(data);
    return data;
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

      console.log(target.request.method)
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

      let processed: any;

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

      if(processed) processed.refId = target.refId;
      opts.url = url
      return {
        request : opts,
        response : json,
        processed : processed
      };//return new MutableDataFrame(processed);
    })

    let results: any = await Promise.all(promises)
    let data = results.map((elt: any) => elt.processed);
    console.log(data);

    //data===[undefined]. I don't know when it happens but sometimes it happens... so here is a fix
    if (data.length == 1 && data[0] === undefined) data = []
    

    //Emit event ot display data in query inspector
    let appEvents = await SystemJS.load('app/core/app_events');
    appEvents.emit('ds-request-response', results);

    //I should use getBackendSrv().datasourceRequest function but I don't know how to display the result of all the queries simultenaously in the uery inspector
    /*getBackendSrv().datasourceRequest({
      url:'https://api.github.com/repos/facebook/react/stats/commit_activity',
      method:'GET'
    }).then((data: any) => console.log('DATA',data));
    getBackendSrv().datasourceRequest({
      url:'https://api.github.com/repos/grafana/grafana/stats/commit_activity',
      method:'GET'
    }).then((data: any) => console.log('DATA',data));*/

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