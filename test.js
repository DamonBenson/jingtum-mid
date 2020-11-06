let inc = (function() {
    let variableName = 0;
    let init = function() {
        variableName += 1;
        console.log(variableName);
    }
    return init;
})();

inc();
inc();