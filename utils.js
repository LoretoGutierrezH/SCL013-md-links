const cli = require('./index');


const [, , ...arguments] = process.argv;
  if ((arguments.includes('--stats') && arguments.includes('--validate')) || arguments.includes('-s') && arguments.includes('-v')) {
    cli.readMD(process.argv[2], {validate: true, stats: true});
  } else if (arguments.includes('--stats') || arguments.includes('-s')) {
    cli.readMD(process.argv[2], {stats: true});
  } else if (arguments.includes('--validate') || arguments.includes('-v')) {
    cli.readMD(process.argv[2], {validate: true});
  } else {
    cli.readMD(process.argv[2]);
  }

  



  
