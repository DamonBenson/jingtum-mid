export function insert(c, table, valueObj) {
    for(let k in valueObj) {
        if(typeof(valueObj[k]) == 'string') {
            valueObj[k] = "'" + valueObj[k] + "'";
        }
    }
    let keys = Object.keys(valueObj);
    let keyStr = keys.join(',');
    let values = Object.values(valueObj);
    let valueStr = values.join(',');
    let sql = 'INSERT INTO ' + table + '(' + keyStr + ')' + ' VALUES(' + valueStr + ')';
    return new Promise((resolve, reject) => {
        c.query(sql, function(err, result) {
            if(err) {
                console.log('err:', err);
                reject('err');
            }
            else if(result) {
                resolve(result);
            }
        });
    });
}

export function select(c, cols, table, where) {
    let colStr = cols.toString();
    let sql = 'SELECT ' + colStr + ' FROM ' + table + ' WHERE ' + where;
    return new Promise((resolve, reject) => {
        c.query(sql, function(err, result) {
            if(err) {
                console.log('err:', err);
                reject('err');
            }
            else if(result) {
                resolve(result);
            }
        });
    });
}

export function update(c, table, set, where) {
    let sql = 'UPDATE ' + table + ' SET ' + set + ' WHERE ' + where;
    return new Promise((resolve, reject) => {
        c.query(sql, function(err, result) {
            if(err) {
                console.log('err:', err);
                reject('err');
            }
            else if(result) {
                resolve(result);
            }
        });
    });
}