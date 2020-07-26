const indexFunctions = require('./index');
const arguments = process.argv;



//console.log(arguments[2], arguments[3]);

const filePath = arguments[2];


indexFunctions.readMD(filePath);

//PROBANDO SINTÁXIS DE PROMESAS
/* const validateURL = (url) => {
  return new Promise((resolve, reject) => {
    setTimeout((actualURL) => {
      resolve(`URL ${actualURL} resuelta correctamente.`);
    }, 1500, url)
  }).then(data => {
    console.log(`URL ${actualURL} resuelta correctamente`);
    console.log(data);
  })
  .catch(error => {
    console.log(error);
  })
}

console.log(validateURL('www.google.com')); */

