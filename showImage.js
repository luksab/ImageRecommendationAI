const fs = require('fs');
var exec = require('child_process').exec;
exec('gwenview '+getPath(process.argv[2]), function callback(error, stdout, stderr){
    // result
});

function getPath(identifier) {
    let string = "/run/media/lukas/Data4Tb/danbooru2019/original/";
    string += '0' + (identifier % 1000).toString().padStart(3, '0') + '/'
    string += identifier + '.'
    if (fs.existsSync(string + 'jpg'))
        string += 'jpg'
    else if (fs.existsSync(string + 'png'))
        string += 'png'
    else {
        return false;
    }
    return string
}