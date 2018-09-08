const chalk = require('chalk');
const { run } = require('../src');

const programs = [
  `(fn a: number -> inc inc a) 2`,
  `
  (
    fn x: number ->
      (fn y: number -> inc y) 1
  )
  inc (
    fn f: number ->
      (fn g: number -> inc g) 2
  ) 3
  `
];

programs.forEach(program => {
  const compiled = run(program);
  console.log(chalk.yellow(`Source code: ${chalk.green(program)}`));
  console.log(
    chalk.yellow(`Evaluation: ${chalk.green(eval(compiled))}`)
  ); /* eslint no-eval: off */
  console.log(chalk.yellow(`Compiled to: ${chalk.green(compiled)}`));
});
