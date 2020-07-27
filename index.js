const colors = require('colors');
const fs = require('fs');
const md = require('markdown-it')();
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const parseHtml = (dom, path) => {
  const anchors = dom.window.document.querySelectorAll('a');
  const anchorsArray = Array.from(anchors);

  const filteredAnchors = anchorsArray.filter(a => a.href.includes('http'));

  //2. Limitar a 50 caracteres el text
  //3. --validate: petición http para evaluar código de estado de las url (200, 301, 404)
  //4. Options --state: función para generar estadísticas
  const linkObjects = filteredAnchors.map(a => {
    return {
      text: a.innerHTML, //limitado a 50 caracteres
      href: a.href,
      file: path
    }
  })

  console.log(linkObjects);
}


const readMD = (path) => {
  fs.readFile(path, (err, data) => {
    if (err) {
      console.log(err)
    }
    console.log('Archivo leído'.green);
    const html = md.render(data.toString());
    const DOM = new JSDOM(html);
    parseHtml(DOM, path);
    //console.log(html);
    //console.log(DOM);

    /* console.log(data.toString());
    return data; */
  })
}

/* file = {};
file.readMD = readMD; */


module.exports = {
  readMD: readMD
}