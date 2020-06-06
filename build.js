const { read, write } = require('to-vfile');
const remark = require('remark');
const mdx = require('remark-mdx');
const visit = require('unist-util-visit');
const util = require('util');
var unified = require('unified');
const remarkParse = require('remark-parse')

import remark2react from 'remark-react'

import ReactDOMServer from 'react-dom/server';
const glob = util.promisify(require('glob'));

import fs from 'fs';
import path from 'path';
import _ from 'lodash';

/**
 * Convert the MDX (Markdown + JSX) to an abstract syntax tree (AST).
 */
async function processMDXAST({ filename }) {
  const file = await read(filename);
  const ast = await remark()
    .use(mdx)
    .use(() => tree => {
      visit(tree, 'jsx', node => {
        node.type = "code";
        node.value = node.value;
      });
    })
    .parse(file);
  return ast;
}

async function postprocessMDX({ entry }) {

  //
  // Assign each entry a title based on the first heading, using the
  // entry id as a default.
  //
  // TODO: what about MDX front-matter?
  //
  entry.title = entry.id;
  visit(entry.ast, 'heading', node => {

    console.log(node);
    let text = "";
    visit(node, 'text', node => {
      text += node.value;
    });

    if (text.trim().length > 0) {
      entry.title = text.trim();
      console.log(entry.id, '->', entry.title);
      return false;
    }
  });
}

async function scanFiles({
  databaseName,
  type,
  extension,
  processors,
  postprocess,
}) {
  const entries = [];
  const files = await glob(`data/${databaseName}/${type}/**/*.${extension}`);
  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const shortpath = path.relative(`data/${databaseName}/${type}`, files[i]);
    const id = shortpath.replace(/\..+?$/i, '');
    const entry = {
      filename: shortpath,
      extension,
      id,
    };

    if (processors) {
      for (let [key, f] of Object.entries(processors)) {
        entry[key] = await f({ filename });
      }
    }
    if (postprocess) {
      await postprocess({ entry });
    }

    entries.push(entry);
  }
  return entries;
}


async function scanDatabase(databaseName) {
  const database = {};

  database.pages = await scanFiles({
    databaseName,
    type: 'pages',
    extension: 'mdx',
    processors: {
      ast: processMDXAST,
    },
    postprocess: postprocessMDX,
  });


  database.components = await scanFiles({
    databaseName,
    type: 'components',
    extension: 'jsx',
  });

  return database;
}


(async () => {
  const database = await scanDatabase("ridley");

  /*

  for (let i = 0; i < files.length; i++) {
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
  };*/
  console.log(database);
  fs.writeFileSync('./src/database.json', JSON.stringify(database, null, 4));
})();

