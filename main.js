const file = require('./index');
const arguments = process.argv;

//console.log(arguments[2], arguments[3]);

const filePath = arguments[2];


file.readMD(filePath);

