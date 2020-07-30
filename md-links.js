const colors = require('colors');
const fs = require('fs');
const md = require('markdown-it')();
const fetch = require('node-fetch');
const jsdom = require('jsdom');
const { EEXIST } = require('constants');
const { JSDOM } = jsdom;
//const axios = require('axios');
const { resolve } = require('path');
/* const asciiTable = require('ascii-table');

let table = new asciiTable('Información de los links del archivo md');
table
  .setHeading('Texto', 'URL')
 */


// Función para limitar texto a 50 caracteres
const truncateTo50 = (text) => {
  if (text.length > 50) {
    const text50 = text.slice(0, 50);
    return text50;
  } else {
    return text;
  }
}


const readMD = (path, options={validate: false, stats: false}) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {

      if (err) reject('No se pudo leer el archivo md :(')
      //console.log('Archivo leído'.green);
      const html = md.render(data.toString());
      const DOM = new JSDOM(html);
      resolve(DOM);
    })
  })
  .then((DOM, options) => {
    return parseHtml(DOM, path, options);
  })
  .then((links) => {
    if (options.validate === true) {
      return validateHref(links)
    } else if (options.stats === true) {
      return urlStats(links);
    } else {
      return links;
    }
  })
  //.catch(error => 'error :( ');
  //.then(res => console.log(res));
  
}


const validateHref = (links) => {
    return new Promise((resolve, reject) => {
      let validated = [];
      links.forEach(link => {
        validated.push(
          fetch(link.href)
          .then(response => {
            return {
              ...link,
              status: response.status
            }
          })
          .catch((error) => {
              return {
                ...link,
                status: `Fail 404, ${error.message}`
              }
          })
        )
      })
      resolve(Promise.all(validated));
    })
    
    
}

const urlStats = (links) => {
  return new Promise((resolve, reject) => {
    const href = links.map(link => link.href)
    let resultMd = md.render(href.toString());
    let link = resultMd.split(',');
    let totalLinks = 0;
    link.forEach(element => {
      if (element.includes('http')) {
        totalLinks = totalLinks + 1;
      }
    });
    //console.log(colors.yellow('Total Links: ' + totalLinks));
    resolve(colors.yellow(`Total links: ${totalLinks}`));
  })
  
};


const parseHtml = (dom, path) => {
  return new Promise((resolve, reject) => {
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
    resolve(linkObjects);
  })
}


const mdLinks = (path, arguments = []) => {
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