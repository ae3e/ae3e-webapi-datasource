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
    //console.log(this.templateSrv.replace('tes fg $distance fdgdfd g'))
    console.log(this.templateSrv.variables);

    const req = options.targets[0].request.query as any;
    req.start_absolute = req.start_absolute === undefined ? options.range.from.unix() * 1000 : req.start_absolute;
    req.end_absolute = req.end_absolute === undefined ? options.range.to.unix() * 1000 : req.end_absolute;
    //req.start_absolute = options.range.from.unix()*1000;
    //req.end_absolute = options.range.to.unix()*1000;

    const value = parseFloat(options.interval).toString();
    const unit = options.interval.replace(value, '');
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
    const template = Handlebars.compile(JSON.stringify(req));

    Handlebars.registerHelper('function', (text, options) => {
      let result;
      switch (options.hash['function']) {
        case 'distanceTags':
          if (text && text.indexOf('-') !== -1) {
            const bounds = text.split('-').map((val: string) => parseInt(val, 10));
            /*var diff = bounds[1]-bounds[0]
              var step = Math.ceil(diff/20/10)*20
              console.log(step)*/
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
          result = UNITS[text.replace(parseFloat(text).toString(), '')];
          break;
        case 'timeValue':
          result = parseFloat(text).toString();
          break;
        default:
          const f = new Function('data', options.hash['function']);
          result = f(text);
      }

      return result;
    });

    const context = {
      unit: UNITS[unit],
      value: value,
      distance: this.templateSrv.replace('$distance'),
      section: this.templateSrv.replace('$section'),
      myinterval: this.templateSrv.replace('$myinterval'),
    };
    let result = template(context);
    result = this.templateSrv.replace(result, options.scopedVars);
    //console.log(result);
    const opts = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: result,
    };
    // Add Authorization header
    if (this.instanceSettings.jsonData.authHeader) {
      (opts.headers as any).Authorization = this.instanceSettings.jsonData.authHeader;
    }

    const res = await fetch(options.targets[0].request.url, opts);
    const json = await res.json();
    /*if (query.jsonata) {
      json = jsonata(query.jsonata).evaluate(json);
    }*/

    //console.log(json);
    const json2: any = [];
    json.queries.forEach((obj: any) => {
      const arr: any = [];
      obj.results.forEach((obj2: any) => {
        obj2.values.forEach((val: any) => {
          arr.push([val[1], val[0]]);
        });
      });
      json2.push({
        target: obj.results[0].name,
        datapoints: arr,
        //unit:"°C"
      });
    });

    console.log(json2);
    const data = json2;

    // Make sure it looks like DataFrame
    /*if (isDataFrame(json)) {
      return json as DataFrame;
    }
    let dataframe = toDataFrame(json)
    console.log(dataframe)
    return dataframe;*/
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
