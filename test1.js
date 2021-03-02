import sqlText from 'node-transform-mysql';

let sql = sqlText.table('work_info').field('work_id, addr').order('RAND()').limit(10).select();

console.log(sql);
