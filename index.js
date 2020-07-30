const colors = require('colors');
const fs = require('fs');
const md = require('markdown-it')();
const fetch = require('node-fetch');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const asciiTable = require('ascii-table');

let table = new asciiTable('Información de los links del archivo md');
table
  .setHeading('Archivo', 'Texto', 'URL')
  .addRow('./README.md', 'Un link a un sitio web', 'www.unsitioweb.com')

//console.log(table.toString()); 


// Función para limitar texto a 50 caracteres
const truncateTo50 = (text) => {
  if (text.length > 50) {
    const text50 = text.slice(0, 50);
    return text50;
  } else {
    return text;
  }
}


const readMD = (path, options = {validate: false, stats: false}) => {
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

const urlStats = (links) => {
  const href = links.map(link => link.href)
  let resultMd = md.render(href.toString());
  let link = resultMd.split(',');
  let totalLinks = 0; 
   link.forEach(element => {
    if (element.includes('http')) {
      totalLinks = totalLinks + 1;
    }
  });
  const uniqueLinks = [...new Set(links.map((link) => link.href))].length;
  console.log(colors.yellow('Total Links: ' + totalLinks)); 
  console.log(colors.red('Unique: ' + uniqueLinks)); 
};

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
    urlStats(linkObjects)
  } else {
    console.log('Solo se muestra la información de cada link');
    linkObjects.forEach(link => console.log(`${colors.cyan(link.text)} ${link.href}`));
  }
}

const mdLinks = (path, arguments) => {
  if ((arguments.includes('--stats') && arguments.includes('--validate')) || arguments.includes('-s') && arguments.includes('-v')) {
    readMD(path, {
      validate: true,
      stats: true
    });
  } else if (arguments.includes('--stats') || arguments.includes('-s')) {
    readMD(path, {
      stats: true
    });
  } else if (arguments.includes('--validate') || arguments.includes('-v')) {
    readMD(path, {
      validate: true
    });
  } else {
    readMD(path);
  }
}

module.exports = {
  readMD: readMD,
  mdLinks: mdLinks
}