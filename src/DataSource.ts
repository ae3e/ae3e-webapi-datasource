// Types
import { DataQueryRequest, DataQueryResponse, DataSourceApi, DataSourceInstanceSettings } from '@grafana/data';

//import { DataFrame/*, isDataFrame, toDataFrame*/ } from '@grafana/data';

import truncate from 'lodash/truncate';

import { MyQuery, MyDataSourceOptions } from './types';
//import jsonata from 'jsonata';
import Handlebars from 'handlebars';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  constructor(private instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>, private templateSrv: any) {
    super(instanceSettings);
  }

  getQueryDisplayText(query: MyQuery) {
    if (!query.request || !query.request.query) {
      return 'Missing Query';
    }
    return truncate(query.request.query, { length: 20 });
  }

  query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    return this.doSingleQuery(options).then(data => {
      console.log(data);
      return data;
    });

    /*const all = options.targets.map(q => this.doSingleQuery(q,options));
    return Promise.all(all).then(data => {
      console.log(data);
      return { data };
    });*/
  }

  async doSingleQuery(options: any): Promise<DataQueryResponse> {
    console.log(options);
    console.log('VARIABLES');
    //console.log(this.templateSrv.replace('$__interval', options.scopedVars));
    //console.log(this.templateSrv.variables);
    
    //If global script for Handlebars exists
    if (this.instanceSettings.jsonData.script && this.instanceSettings.jsonData.script!='') {
      let func = new Function('text,options', this.instanceSettings.jsonData.script) as any;

      Handlebars.registerHelper('function', (text, opts) => {

        let result = func(text,opts);

        /*switch (options.hash['function']) {
          case 'distanceTags':
            if (text && text.indexOf('-') !== -1) {
              const bounds = text.split('-').map((val: string) => parseInt(val, 10));

              const data = [];
              for (let i = bounds[0]; i < bounds[1]; i = i + 10) {
                if (i === bounds[0]) {
                  data.push(i + '"');
                }
                if (i === bounds[1] - 10) {
                  data.push('"' + i);
                }
                if (i !== bounds[0] && i !== bounds[1] - 10) {
                  data.push('"' + i + '"');
                }
              }
              const mystring = data.join(',');
              console.log(mystring);
              result = data.join(',');
              //return '200","210'
            }
            break;
          case 'timeUnit':
            const UNITS = {
              ms: 'MILLISECONDS',
              s: 'SECONDS',
              m: 'MINUTES',
              h: 'HOURS',
              d: 'DAYS',
              w: 'WEEKS',
              M: 'MONTHS',
              y: 'YEARS',
            } as any;
            result = UNITS[text.replace(parseFloat(text).toString(), '')];
            break;
          case 'timeValue':
            result = parseFloat(text).toString();
            break;
          default:
            const f = new Function('data', options.hash['function']);
            result = f(text);
        }*/

        return result;
      });

    }

    const context = {
      interval: this.templateSrv.replace('$__interval', options.scopedVars),
    } as any;
    this.templateSrv.variables.forEach((elt: any)=>{
      context[elt.name]=elt.current.text;
    })

    function replaceVariables(ctxt: any, value: string){  
      const template = Handlebars.compile(value);
      let res = template(context);
      res = ctxt.templateSrv.replace(res, options.scopedVars);
      return res;
    }

    var promises: any = options.targets.map(async (target: any)=>{
      const req = target.request.query as any;

      const opts = {
        method: target.request.method,
        headers: {
          'Content-Type': 'application/json',
        }
      } as any;

      if(target.request.method==='POST'){
        opts.body = replaceVariables(this,JSON.stringify(req));
      }

      let url = replaceVariables(this,target.request.url);
      
      const res = await fetch(url, opts);
      const json = await res.json();

      let processed: any[] = [];

      try {
        if (target.request.script && target.request.script !== '') {
          var f = new Function('data,variables', target.request.script);
          processed = f(json);
        }else{
          processed = json;
        }
      } catch (e) {
        console.log(e);
      }

      return processed;
    })

    let results = await Promise.all(promises)
    let data  = results.map((elt:any)=>elt[0]);
    console.log(data);

    return {data};
    /*  const json = await res.json();

      let data: any[] = [];

      try {
        if (target.request.script && target.request.script !== '') {
          var f = new Function('data,variables', target.request.script);
          data = f(json);
        }else{
          data = json;
        }
      } catch (e) {
        console.log(e);
      }
    })*/
    
    // Make sure it looks like DataFrame
    /*if (isDataFrame(json)) {
      return json as DataFrame;
    }
    let dataframe = toDataFrame(json)
    console.log(dataframe)
    return dataframe;*/
    //console.log(data)
    //return { data };
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
