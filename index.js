const colors = require('colors');
const fs = require('fs');
const md = require('markdown-it')();
const fetch = require('node-fetch');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;


// Función para limitar texto a 50 caracteres
const truncateTo50 = (text) => {
  if (text.length > 50) {
    const text50 = text.slice(0, 50);
    return text50;
  } else {
    return text;
  }
}

const parseHtml = (dom, path, options) => {
  const anchors = dom.window.document.querySelectorAll('a');
  const anchorsArray = Array.from(anchors);

  const filteredAnchors = anchorsArray.filter(a => a.href.includes('http'));

 
  const linkObjects = filteredAnchors.map(a => {
    return {
      text: truncateTo50(a.innerHTML), //limitado a 50 caracteres
      href: a.href,
      file: path
    }
  })

  
  if (options.validate === true && options.stats === true) {
    console.log('Validación + Estadísticas');
  } else if (options.validate === true) {
    validateHref(linkObjects);
  } else if (options.stats === true) {
    console.log('Se ejecuta la función de estadística');
  } else {
    console.log('Solo se muestra la información de cada link');
    linkObjects.forEach(link => console.log(`${colors.cyan(link.text)} ${link.href}`));
  }
 
}

const readMD = (path, options = {validate: false, stats: false}) => {
  //console.log(options.validate);
  fs.readFile(path, (err, data) => {
    if (err) {
      console.log(err)
    }
    console.log('Archivo leído'.green);
    const html = md.render(data.toString());
    const DOM = new JSDOM(html);
    parseHtml(DOM, path, options);
  })
}

const validateHref = (links) => { 
  links.map(element => {
    fetch(element.href)
      .then(response => {
        if (response.status === 200) {
          console.log('Link: ' + element.href +  ' Estado ' + colors.green(response.status));
        } else {
          console.log(`Link: ${element.href} Estado ${response.status}`);
        }
      })
      .catch(error =>
        console.log('Link con error: ' + element.href))
  });
};


module.exports = {
  readMD: readMD
}