const colors = require('colors');
const fs = require('fs');
const md = require('markdown-it')();
const fetch = require('node-fetch');
const jsdom = require('jsdom'); 
const { EEXIST } = require('constants');
const { JSDOM } = jsdom;
//const axios = require('axios');
const  Table  = require ('cli-table') ; 


const { resolve } = require('path');

// Función para limitar texto a 50 caracteres
const truncateTo40 = (text) => {
  if (text.length > 40) {
    const text40 = text.slice(0, 40);
    return text40;
  } else {
    return text;
  }
}

const readMD = (path, options={validate: false, stats: false}) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {

      if (err) reject('No se pudo leer el archivo md :(')
      console.log(colors.blue('ℹ Archivo leído'));
      const html = md.render(data.toString());
      const DOM = new JSDOM(html);
      resolve(DOM);
    })
  })
  .then((DOM, options) => {
    return parseHtml(DOM, path, options);
  })
  .then((links) => {
    if (options.validate === true && options.stats === true) {
      const myPromises = [
        new Promise((resolve) => setTimeout(() => {resolve(urlStats(links))}, 1000)),
        new Promise((resolve) => setTimeout(() => {resolve(validateStats(links))}, 1000)),
        new Promise((resolve) => setTimeout(() => {resolve(validateHref(links))}, 3000))
      ];
      
      Promise.all(myPromises).then(responses => {
        responses.map(response => console.log(response));
      })
    } else if (options.validate === true) {
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
            if (response.status !== 200) {
              return {
                ...link,
                status: `No soy tan malito ${response.status}`
              }
            }
            return {
              ...link,
              status: (colors.green('√ Ok ') + response.status)
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
      resolve(Promise.all(validated)); //equivale a los resultados de todas las promesas
    })
    .then(res =>{
      const table = new Table({
      head: [colors.green('LINK'), colors.green('STATUS')] , colWidths: [100, 20] 
      });
    
      res.forEach(link => {
      table.push(
          [colors.cyan(link.href), link.status]
        );
      }) 
       console.log(table.toString())
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
    const uniqueLinks = [...new Set(links.map((link) => link.href))].length;
      // instantiate
      const table = new Table({
        head: [colors.green('Total Links'), colors.green('Unique')] , colWidths: [20, 20] 
      });
        table.push(
          [totalLinks, uniqueLinks]
        );
      console.log(table.toString())
  })
};

const validateStats = links => {
  return new Promise((resolve, reject) => {
	let allLinks = [];
	let broken = 0;
	links.forEach((link) => { allLinks.push(fetch(link.href)
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
    })); 
 })
    resolve(Promise.all(allLinks))
  })
  .then(res =>{
    const broken = res.filter(link => link.status !=200 )
    // instantiate
    const table = new Table({
      head: [colors.green('Broken')] , colWidths: [20] 
      });
    
        table.push(
            [broken.length]
        );
  
    console.log(table.toString());
    console.log('\n')

  })
}

const parseHtml = (dom, path) => {
  return new Promise((resolve, reject) => {
    const anchors = dom.window.document.querySelectorAll('a');
    const anchorsArray = Array.from(anchors);
    const filteredAnchors = anchorsArray.filter(a => a.href.includes('http'));

    const linkObjects = filteredAnchors.map(a => {
      return {
        text: truncateTo40(a.innerHTML), //limitado a 40 caracteres
        href: a.href,
        file: path
      }
    })
    resolve(linkObjects);
  })
}

module.exports = {
  readMD: readMD,
}