# <img src="src/img/WebAPI.svg" width="30" style="margin-bottom:-5px"> Web API DataSource

Datasource to connect to any web service using HTTP requests (GET or POST).

Data returned can be transformed using user-defined script to be compliant with Grafana.


## Query Editor

![Settings](/img/query.png)

The following options can be specified:
- **Url** : Contains the URL of the request. (ie `https://api.github.com/orgs/$project/repos?per_page=100` where `$project` is a Grafana's variable)
- **Method** : Contains the request's method (GET, POST, etc.)
- **Headers** : Contains the associated Headers object of the request (in JSON format)
    ```javascript
    {
        "Content-Type":"application/json",
        "X-Custom-Header":"AnotherValue"
    }
    ```
- **Body** : Contains the request body data as string (can be JSON or encodedURL)
- **Script** : Contains function to transform data. See timeseries and table format on this [documentation page](https://grafana.com/docs/grafana/latest/plugins/developing/datasources/) to be compliant with Grafana.
    ```javascript
    //Example with Github example using previous Url value
    let values = data.map(elt=>[new Date(elt.updated_at),elt.name,elt.watchers])
    return [
        {
            "columns": [
            {
                "text": "Time",
                "type": "time",
                "sort": true,
                "desc": true,
            },
            {
                "text": "name",
            },
            {
                "text": "stars",
            }
            ],
            "rows": values,
            "type": "table"
        }
    ]
    ```
*Url* and *Body* fields can contain Grafana's variables (ie `$__from`) and/or Handlebars expressions (ie `{{function interval function='timeUnit'}}`. See below).

## Settings

![Settings](/img/conf.png)

Global function is used by [Handlebarsjs](https://handlebarsjs.com/) to transform specific variables before to request the data.
It is an helper script where hash arguments can be obtained from `options` parameter and `text` is the value (see Handlebars [expressions](https://handlebarsjs.com/guide/expressions.html#helpers-with-hash-arguments)) 

example:
```javascript
let result;
switch (options.hash['function']) {
    case "timeUnit":
    const UNITS = {
        ms: 'MILLISECONDS',
        s: 'SECONDS',
        m: 'MINUTES',
        h: 'HOURS',
        d: 'DAYS',
        w: 'WEEKS',
        M: 'MONTHS',
        y: 'YEARS',
    };
    result = UNITS[text.replace(parseFloat(text).toString(), '')];
    break;
    case "timeValue":
    result = parseFloat(text).toString();
    break;
    default:
    const f = new Function('data', options.hash['function']);
    result = f(text);
}

return result;
```
then you can use it in *Url* or *Body* fields :

`{{{function interval function='timeUnit'}}}` will be replaced by `WEEKS` if *interval* value is **2w**

or

`{{function distance function='return Math.trunc(parseInt(data)/10)*10'}}` will be replaced by `20` if *distance* value is **22.34**

where `interval` is a Grafana's builtin variable and `distance` a Grafana's custom variable
