const colors = require('colors');
const fs = require('fs');
const md = require('markdown-it')();
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

//ejemplo de uso --> let result = md.render('lo que quiero transformar en html');
//console.log(result);


//4. Solicitud HTTP mediante axios
const axios = require('axios');
const checkStatus = (href) => {
  axios.get(href)
  .then(response => console.log(response.status, response.statusText))
  .catch(error => console.log('404 Fail'));
}




//3. Función para limitar texto a 50 caracteres
const truncateTo50 = (text) => {
  if (text.length > 50) {
    const text50 = text.slice(0, 50);
    return text50;
  } else {
    return text;
  }
}

//2. Función que filtra los elementos "a" (links) del DOM y devuelve array de objetos
const filterTextAndHref = (DOM, path) => {
 const anchors = DOM.window.document.querySelectorAll('a');
 const anchorsArray = Array.from(anchors);
 //Para filtrar anchors que son URLs externas
 const UrlAnchorsOnly = anchorsArray.filter(a => a.href.includes('http'));

 const textAndHref = UrlAnchorsOnly.map(a => {
   return {
     text: truncateTo50(a.innerHTML),
     href: a.href,
     file: path
   };
 });

  textAndHref.forEach(link => {
    console.log(link.file, link.text, link.href);
    checkStatus(link.href);
  })
  //return textAndHref;

}

// 1. Función que lee la ruta del archivo .md entregada en la terminal como argumento
const readMD = (path) => {
  fs.readFile(path, (err, data) => {
    if (err) {
      console.log(err)
    }
    console.log('Archivo leído'.green);
    let outputHtml = md.render(data.toString());
    
    const DOM = new JSDOM(outputHtml);
    filterTextAndHref(DOM, path);

    //console.log(data.toString());
    //return data;
  })
}

/* file = {};
file.readMD = readMD;


module.exports = file; */


//Lo mismo de arriba, pero más ordenado
module.exports = {
  readMD: readMD,
}

