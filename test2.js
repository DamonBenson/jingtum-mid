var ninja = {};

addMethod(ninja, 'whatever', function() {
    console.log(this);
});
addMethod(ninja, 'whatever', function(a) {
    console.log('b');
});
// addMethod(ninja, 'whatever', function(a,b) {
//     console.log('c');
// });

ninja['whatever']();
// ninja['whatever'](1);
// ninja['whatever'](1,2);

function addMethod(object, name, fn) {
    var old = object[name];
    object[name] = function() {
        console.log(arguments.length);
        if(fn.length == arguments.length) {
            console.log('if');
            return fn.apply(this, arguments); // this指向object，使用apply保证ninja['whatever']()能够操作ninja对象内其他属性
        }   
        else if (typeof old == 'function') { // 相当于把每个新addMethod()的函数加在原函数后，闭包套娃
            console.log('else if');
            return old.apply(this, arguments);
        }    
    }
}