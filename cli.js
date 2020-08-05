const colors = require('colors');
const fs = require('fs');
const md = require('markdown-it')();
const fetch = require('node-fetch');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const  Table  = require ('cli-table') ; 
const logSymbols = require('log-symbols');

//1. Función de entrada
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

// Función para limitar texto a 50 caracteres
const truncateTo40 = (text) => {
  if (text.length > 40) {
    const text40 = text.slice(0, 40);
    return text40;
  } else {
    return text;
  }
}

//2. Leer archivo
const readMD = (path, options = {validate: false, stats: false}) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
       if (err) {
         reject(err);
       } else {
         resolve(data)
       }
    })
  })
  .then(data => {
     //console.log('Archivo leído'.green);
     const html = md.render(data.toString());
     const DOM = new JSDOM(html);
     parseHtml(DOM, path, options);
  })
  .catch(err => console.log(err))
}

//3. Mostrar links
const parseHtml = (dom, path, options) => {
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

  if (options.validate === true && options.stats === true) {
    urlStats(linkObjects);
    validateStats(linkObjects)
    setTimeout(() => validateHref(linkObjects),4000) ;
  } else if (options.validate === true) {
    validateHref(linkObjects);
  } else if (options.stats === true) {
    urlStats(linkObjects)
  } else {

// instantiate
  const table = new Table({
  head: [colors.green('TEXTO'), colors.green('LINK')] , colWidths: [50, 75] 
});

    linkObjects.forEach(link => {
      table.push(
        [colors.cyan(link.text), link.href]
    );
    })
    console.log(table.toString())
  }
}

//4a. Validación

const validateHref = (links) => {

  links.map(element => {
    fetch(element.href)
      .then(response => {
        if (response.status === 200) {
          console.log(colors.cyan(logSymbols.success,'Link: ') + element.href +  ' Estado ' + colors.green(response.status));
        } else if(response.status === 404){
          console.log(logSymbols.error`Link: ${element.href} Estado ${response.status}`);//404
        } 
      })
      .catch((err) => {
       console.log(colors.red(logSymbols.error,'Link con error: ') + element.href)
      })//link no valido
      
  }); 

};  

//4b. Estadísticas
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
  
  let tableStats = new Table();
  tableStats.push(
      { 'Total Links': totalLinks },
      { 'Unique': uniqueLinks}
  );
  console.log('ʕ•͡ᴥ•ʔ')
  console.log(tableStats.toString());
   
 
  /* const table = new Table({
    head: [colors.cyan('Total Links'), colors.cyan('Unique')] , colWidths: [20, 20] 
  });
    table.push([totalLinks, uniqueLinks]);
    console.log(table.toString()) */
  /* console.log(colors.yellow('Total Links: ' + totalLinks));
  console.log(colors.red('Unique: ' + uniqueLinks)); */
};

//funcion Broken
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
    let tableBroken = new Table();
    tableBroken.push(
      { 'Broken     ': broken.length }
  );
  process.stdout.write(tableBroken.toString());
    //console.log('Broken: ', broken.length)
  })
}
 
module.exports = {
  readMD: readMD,
  mdLinks: mdLinks
}