const chalk = require('chalk');
const { run } = require('../src');

const programs = [
  `(fn a: number -> mul a a)`,
  `(fn a: number -> div a 2) -4`,
  `(fn a: number -> sum a a) 1`,
  `(fn a: number -> sub a 2) -3`,
  `(fn a: number -> mul a a) 2.2`,
  `(fn a: number -> div a 2) 4.3`,
  `(fn a: number -> sum a a) 1231.123`,
  `(fn a: number -> sub a 123123.1232) -12341243.1241242`,
  `(fn a: number -> sum a mul a sub a 3) -1`,
  `(fn a: number -> mul 2 inc a) 1`,
  `(fn a: number -> pred a) 1`,
  `(fn a: number -> sum 2 (fn b: number -> sum b (fn b: number -> inc inc b) 2) 2) 1`,
  `(fn a: number -> inc a) (fn b: number -> inc b) 1`,
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
