const colors = require('colors');
const fs = require('fs');
const md = require('markdown-it')();
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

//ejemplo de uso --> let result = md.render('lo que quiero transformar en html');
//console.log(result);

const filterTextAndHref = (DOM, path) => {
 const anchors = DOM.window.document.querySelectorAll('a');
 const anchorsArray = Array.from(anchors);
 const textAndHref = anchorsArray.map(a => {
   return {
     text: a.innerHTML,
     href: a.href,
     file: path
   };
 })
  console.log(textAndHref);
  //return textAndHref;

}

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

module.exports = {
  readMD: readMD,
}

