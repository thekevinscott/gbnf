import '@vanillawc/wc-monaco-editor';
import { fetchLlamaCPP, fetchTestCases } from './api.js';

const grammars = import.meta.glob('./grammars/*.gbnf', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const form = document.getElementById('form');
const grammarEditor = document.getElementById('grammar');
const output = document.getElementById('output');
const select = document.getElementById('grammar-selector') as HTMLSelectElement;
Object.entries(grammars).forEach(([path, grammarContents]: [string, string]) => {
  const option = document.createElement('option');
  option.value = grammarContents;
  const file = path.split('/').pop().split('.').shift();
  option.innerText = file;
  if (file === 'simple') {
    option.selected = true;
    grammarEditor.setAttribute('value', grammarContents);
  }
  // console.log(option)
  select.appendChild(option);
});


select.onchange = () => {
  grammarEditor.setAttribute('value', select.value);
};

form.onsubmit = async (e) => {
  e.preventDefault();

  generateTestCases((grammarEditor as any).value, 50);
};


const log = (obj: string) => {
  output.innerText = obj;
  // output.innerText = JSON.stringify(obj, null, 2);
};

const generateTestCases = async (grammar: string, n: number) => {
  const output = {
    grammar,
    testCases: [],
  }
  // log(output);
  const prompt = `
  Write me a mathematically valid expression. Ensure that you output something.

  Make the output simple and short. Here are some examples:
  
  \`\`\`
  1 + 2 = 3
  4 / 4 = 2
  1 + 2 * 3 = 9
  \`\`\`
  `
  await fetchTestCases(prompt, grammar, ({ parsedChunk, partial }, i) => {
    if (output.testCases.length <= i) {
      output.testCases.push('');
    }
    output.testCases[i] = partial.trim();
    const testCases = new Set(output.testCases);
    log([
      `export const grammar = \`${output.grammar.split("\\n").join('\\\\n')}\`;`,
      `export const testCases = ${JSON.stringify(Array.from(testCases), null, 2)}`
    ].join('\n'));
    // log(output);
  }, n);
}

