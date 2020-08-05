const colors = require('colors');
const fs = require('fs');
const md = require('markdown-it')();
const fetch = require('node-fetch');
const jsdom = require('jsdom'); 
const { EEXIST } = require('constants');
const { JSDOM } = jsdom;
//const axios = require('axios');
const PQueue = require('p-queue');


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
    if (options.validate === true && options.stats === true) {
     const queue = new PQueue({concurrency: 1});

     /* queue.addAll(
       () => urlStats(links),
       () => validateStats(links),
       () => validateHref(links))
     .then(responses => {
      responses.map(response => console.log(response));
      }); */
      const myPromises = [
        () => new Promise((resolve) => setTimeout(() => {
          resolve(validateStats(links));
          //console.log('validateHref');
        }, 1000)),
        () => new Promise((resolve) => setTimeout(() => {
          resolve(urlStats(links));
          //console.log('urlStats');
        }, 2000)),
        () => new Promise((resolve) => setTimeout(() => {
          resolve(validateHref(links));
          //console.log('validaStats');
        }, 10)),
      ];
      
      queue.addAll(myPromises).then(responses => {
        responses.map(response => {
        return console.log(response)
        }); 
      }); 

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
      resolve(Promise.all(validated)); //equivale a los resultados de todas las promesas
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
    //console.log(colors.yellow('Total Links: ' + totalLinks));
    resolve(colors.yellow(`Total links: ${totalLinks}\nUnique: ${uniqueLinks}`));
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
    console.log(colors.yellow('Broken: ', broken.length))
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


/* const mdLinks = (path, arguments = []) => {
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
 */
module.exports = {
  readMD: readMD,
 /*  mdLinks: mdLinks */
}