const mdLinks = require('./md-links.js').readMD;

//así lo debería poder utilizar alguien que instala nuestra librería/API
//arguments es opcional, si no se especifica, es igual a un array vacío []

//mdLinks('README.md');
mdLinks('./README.md', { validate: true, stats: true } )
.then(data => console.log(data));
//mdLinks('./README.md', { stats: true });
//mdLinks('./README.md', { validate: true, stats: true });

