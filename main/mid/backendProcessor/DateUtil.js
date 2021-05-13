// LearnAboutDateUtil();
// let TimeStampMap = getMonthTimeStampMap();
// console.log(TimeStampMap);
// let TimeStampArray = getMonthTimeStampArray();
// console.log(TimeStampArray);
export function LearnAboutDateUtil(){
    let timeToday = Math.round((new Date())/ 1000);
    let timeNow = new Date();
    console.log("timeToday：",timeToday);
    console.log("timeToday：",timeNow.getDate());
    let now = new Date(); //当前日期 
    let nowMonth = now.getMonth(); //当前月 
    let nowYear = now.getFullYear(); //当前年 
    //本月的开始时间
    let monthStartDate = new Date(nowYear, nowMonth-1); 
    //本月的结束时间
    let monthEndDate = new Date(nowYear, nowMonth+1, 0);
    let timeStart=Date.parse(monthStartDate)/1000;//s
    let timeEnd=Date.parse(monthEndDate)/1000;//s
    console.log("now",now);
    console.log("nowMonth",nowMonth);
    console.log("nowYear",nowYear);
    console.log("monthStartDate",monthStartDate);
    console.log("monthEndDate",monthEndDate);
    console.log("timeStart",timeStart);
    console.log("timeEnd",timeEnd);
    for (let index = 0; index < 14; index++) {
        let time = new Date(nowYear, index); 
    
        console.log("time",time,"Month",index);
    
    }
    console.log("now",now);
}
export function getMonthTimeStampMap(MonthsAmong = 12,MonthOrWeek = true){
    let TimeStampMap = {};
    const MonthName = {0:"一月",1:"二月",2:"三月",3:"四月",4:"五月",5:"六月",
                        6:"七月",7:"八月",8:"九月",9:"十月",10:"十一月",11:"十二月"}
    let now = new Date(); //当前日期 
    
    
    let nowMonth = now.getMonth(); //当前月 
    let nowYear = now.getFullYear(); //当前年 
    TimeStampMap[0] = Date.parse(now)/1000;

    for (let index = 0; index < MonthsAmong; index++) {
        let time = new Date(nowYear, nowMonth - index); 
        let timeStart = Date.parse(time)/1000;//s
        // TimeStampMap[MonthName[time.getMonth()]] = timeStart;
        TimeStampMap[index+1] = timeStart;
        // console.log("time",time,"Month",index,"timeStart",timeStart,"time.getMonth",time.getMonth());
    }
    return TimeStampMap;
}
export function getMonthTimeStampArray(MonthsAmong = 12,MonthOrWeek = true){
    let TimeStampArray = [];
    let MonthArray = [];

    const MonthName = {0:"一月",1:"二月",2:"三月",3:"四月",4:"五月",5:"六月",
                        6:"七月",7:"八月",8:"九月",9:"十月",10:"十一月",11:"十二月"}
    let now = new Date(); //当前日期 
    let nowMonth = now.getMonth(); //当前月 
    let nowYear = now.getFullYear(); //当前年 
    MonthArray.push(transMonthName(now));
    TimeStampArray.push(Date.parse(now)/1000);
    for (let index = 0; index < MonthsAmong; index++) {
        let time = new Date(nowYear, nowMonth - index); 
        let timeStart = Date.parse(time)/1000;//s
        MonthArray.push(transMonthName(time));
        TimeStampArray.push(timeStart);
        console.log("time",time,"Month",index,"timeStart",timeStart,"time.getMonth",time.getMonth());
    }
    return [TimeStampArray, MonthArray];
}
export function transMonthName(A_Date){
    const MonthName = {0:"一月",1:"二月",2:"三月",3:"四月",4:"五月",5:"六月",
                        6:"七月",7:"八月",8:"九月",9:"十月",10:"十一月",11:"十二月"};
    // TimeStamp = Date(TimeStamp);
    // TimeStamp = Date.apply(TimeStamp);
    // TimeStamp = Date.UTC(TimeStamp);
    // TimeStamp = Date.UTC(TimeStamp);
    // let now = new Date(); //当前日期 
    // console.log("TimeStamp",TimeStamp);
    // console.log("now",now);
    let theMonth = MonthName[A_Date.getMonth()];
    
    return theMonth;
}
// console.log(transMonthName(now));