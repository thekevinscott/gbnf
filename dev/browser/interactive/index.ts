import '@vanillawc/wc-monaco-editor';
import GBNF from '../../../packages/gbnf/backup/index.js';
const grammars = import.meta.glob('./grammars/*.gbnf', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const form = document.getElementById('form');
const grammar = document.getElementById('grammar');
const select = document.getElementById('grammar-selector') as HTMLSelectElement;
Object.entries(grammars).forEach(([path, grammarContents]: [string, string]) => {
  const option = document.createElement('option');
  option.value = grammarContents;
  const file = path.split('/').pop().split('.').shift();
  option.innerText = file;
  if (file === 'simple') {
    option.selected = true;
    grammar.setAttribute('value', grammarContents);
  }
  // console.log(option)
  select.appendChild(option);
});


select.onchange = () => {
  grammar.setAttribute('value', select.value);
};

form.onsubmit = async (e) => {
  e.preventDefault();
  parseGBNF((grammar as any).value);
};

const parseGBNF = (grammarContents: string) => {
  let gbnf;
  console.log('ok')
  try {
    gbnf = GBNF(grammarContents)
    gbnf.parse();
  } catch (err) {
    console.error(err)
  }
}

parseGBNF((grammar as any).value);
