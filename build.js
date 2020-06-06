

const {read, write} = require('to-vfile');
const remark = require('remark');
const mdx = require('remark-mdx');
const visit = require('unist-util-visit');
const util = require('util');

import remark2react from 'remark-react'

import ReactDOMServer from 'react-dom/server';
const glob = util.promisify(require('glob'));

import fs from 'fs';


(async () => {
    const database = {};
    const files = await glob("data/**/*.mdx");

    for (let i = 0; i < files.length; i++) {
        const filename = files[i];
        const entry = {};
        const id = filename
            .replace(/^\.\//,'')
            .replace(/^data\//,'')
            .replace(/\.mdx$/i, '');
        const file = await read(filename);
        const contents1 = await remark()
          .use(mdx)
          .use(() => tree => {
            
            visit(tree, 'jsx', node => {
              node.type = "code";
              node.value = node.value;
            })
          })
          .use(() => tree => {
              entry.ast = tree;
            })
          .process(file);
          
        entry.content = contents1;
      
        const contents = await remark()
              .use(remark2react)
              .process(contents1)
      
        let text = contents.result;
        let html = ReactDOMServer.renderToStaticMarkup(text);
        console.log(html)

        entry.id = id;
        database[id] = entry;
    };
    console.log(database);
    fs.writeFileSync('./src/database.json', JSON.stringify(database, null, 4));
})();

