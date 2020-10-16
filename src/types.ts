import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface WebQuery {
  url: string;
  method: string;
  body: string;
  headers:any;
  script: string;
  variables?: any;
}

export interface MyQuery extends DataQuery {
  url: string;
  method: string;
  body: string;
  headers:any;
  script: string;
  variables?: any;
}

export const defaultQuery: Partial<MyQuery> = {
    url:'https://api.github.com/repos/grafana/grafana/stats/commit_activity',
    method:'GET',
    body:'',
    headers:'',
    script:`//Default example with GRafan's commits on Github
    let columns = {
        dates:[],
        totals:[]
    }
    
    data.forEach(elt=>{
        columns.dates.push(new Date(elt.week*1000));
        columns.totals.push(elt.total);
    })
    return {
        name:"Grafana's commit",
        fields:[
             {
                name:"Date",
                type:"time",
                values:columns.dates
            },
    
            {
                name:"Commits",
                type:"number",
                values:columns.totals
            }
        ]
    }`
};
/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  script?: string;
  authHeader?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
  apiKey?: string;
}
