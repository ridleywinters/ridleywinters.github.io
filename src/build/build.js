const { read } = require('to-vfile');
const remark = require('remark');
const mdx = require('remark-mdx');
const visit = require('unist-util-visit');
const util = require('util');
var frontmatter = require('remark-frontmatter')
var unifMap = require('unist-util-map');

const glob = util.promisify(require('glob'));

import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import YAML from 'yaml';

import wikilinks from './parsers/wikilinks.js'



import * as babel from '@babel/core';

import babelPresetEnv from '@babel/preset-env';
import babelPresetReact from '@babel/preset-react';

import babelPlugin0 from '@babel/plugin-proposal-class-properties';
import babelPlugin1 from '@babel/plugin-proposal-object-rest-spread';
import babelPlugin2 from '@babel/plugin-proposal-async-generator-functions';
import babelPlugin3 from '@babel/plugin-transform-async-to-generator';

/**
 * Given ES6/JSX source code transforms it into a cross-browser JavaScript
 * that can be run as the source in a Function object.
 */
function parseES6(source) {
    const data = {};

    // All the "work" is in the config file and the installed plugins
    const options = {
        configFile: false,
        'presets': [
            [
                babelPresetEnv,
                {
                    'targets': {
                        'browsers': '> 5%',
                    },
                },
            ],
            babelPresetReact,
        ],
        'plugins': [
            babelPlugin0,
            babelPlugin1,
            babelPlugin2,
            babelPlugin3,
        ],
        parserOpts: {
            allowReturnOutsideFunction: true,
        },
    };
    let result = babel.transformSync(source, options);

    data.err = null;
    data.source = source;
    data.result = result;
    data.compiled = _.get(result, 'code', 'throw new Error(\'compilation failed\')');

    const code = [
        '(function() {',
        data.compiled,
        '})()',
    ].join('\n');
    return code;
}

function parseES6Expression(expr) {
    return parseES6(`return (${expr})`);
}

/**
 * context is a map of variable names to values
 */
function evaluateJSExpression(sourceExpr, context = {}) {
    const f = new Function(...Object.keys(context), `return (${sourceExpr})`);
    return f(...Object.values(context));
}

function evaluateDefaultExport(source, additionalContext = {}) {
    const exports = {};
    const context = {
        ...additionalContext,
        exports,
    };
    let f;
    try {
        f = new Function(...Object.keys(context), source);
    } catch (err) {
        // eslint-disable-next-line
        console.error('Exception constructing function:', source);
        throw err;
    }
    try {
        f(...Object.values(context));
    } catch (err) {
        // eslint-disable-next-line
        console.error('Exception evaluating:', source);
        throw err;
    }
    return exports.default;
}



function processMDXString(s) {
    const ast = remark()
        .use(mdx)
        .use(frontmatter, ['yaml', 'toml'])
        .use(wikilinks, { inlineMode: true })
        .parse(s);
    return ast;
}

/**
 * Convert the MDX (Markdown + JSX) to an abstract syntax tree (AST).
 */
async function processMDXAST({ filename }) {
    const file = await read(filename);
    const ast = await remark()
        .use(mdx)
        .use(frontmatter, ['yaml', 'toml'])
        .use(wikilinks, { inlineMode: true })
        .parse(file);
    return ast;
}

async function postprocessMDX({ entry }) {

    entry.tags = [];

    //
    // Check for front-matter
    //
    entry.properties = {};
    visit(entry.ast, 'yaml', node => {
        Object.assign(entry.properties, YAML.parse(node.value));
        if (entry.properties.title) {
            entry.title = entry.properties.title;
        }
        if (entry.properties.tags) {
            if (typeof entry.properties.tags === 'string') {
                entry.properties.tags = entry.properties.tags.split(',').map((tag) => tag.trim());
            }
            entry.tags = entry.properties.tags;
        }
    });

    entry.ast = unifMap(entry.ast, (node) => {
        if (
            node.type === 'code' &&
            node.lang && (
                node.lang.match(/^object:/) ||
                node.lang.match(/^@([^\s]+)/)
            )
        ) {
            let m = node.lang.match(/^object:([^\s]+)/)
                || node.lang.match(/^@([^\s]+)/)
                ;

            try {
                let value = YAML.parse(node.value);
                value = _.cloneDeepWith(value, function (value) {
                    if (_.isObject(value) && !_.isArray(value)) {
                        let t = {};
                        _.each(value, (v, k) => {
                            let m;
                            m = k.match(/(.+?)\$(.+)$/);
                            if (m) {
                                k = m[1];
                                v = processMDXString(v);
                            }
                            t[k] = v;
                        })
                        return t;
                    }
                });

                // Parse additional text ("meta") as comma-delimited URI decoded
                let params = {};
                let name = undefined;
                if (node.meta) {
                    node.meta
                        .split(',')
                        .map((s) => s.trim().split('=', 2).map(
                            (s) => decodeURIComponent(s.trim())
                        ))
                        .forEach((pair) => {
                            params[pair[0]] = pair[1];
                        });

                    if (params.name) {
                        name = params.name;
                    }
                }
                

                return {
                    type: 'object',
                    kind: m[1],
                    value,
                    meta: node.meta,
                    params,
                    name,

                }
            } catch (err) {
                console.log(err);
                return {
                    type: 'code',
                    lang: "yaml",
                    value: node.value,
                };
            }

        } else if (node.type === 'code' && node.lang === 'eval-jsx') {
            try {
                const source = `return <React.Fragment>${node.value}</React.Fragment>;`;
                node.value2 = parseES6(source);
            } catch (err) {
                console.log(err);
                return {
                    type: 'code',
                    lang: "jsx",
                    value: [
                        "//",
                        "// Parse error!!!",
                        "//",
                    ].join('\n') + '\n' + node.value,

                };
            }
        } else if (node.type === 'jsx') {
            // This is a JSX expression, so we need to put a "return" in front of it
            node.text = node.value;
            node.parsed = parseES6(`return ${node.value}`);
            delete node.value;
        }
        return node;
    })

    //
    // Assign each entry a title based on the first heading, using the
    // entry id as a default.
    //
    // TODO: what about MDX front-matter?
    //
    if (!entry.title) {
        visit(entry.ast, 'heading', node => {
            let text = "";
            visit(node, 'text', node => {
                text += node.value;
            });

            if (text.trim().length > 0) {
                entry.title = text.trim();
                return false;
            }
        });

        if (!entry.title) {
            entry.title = entry.id;
        }
    }
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
        const pagepath = shortpath.split('/');
        const id = pagepath.pop().replace(/\..+?$/i, '');
        const entry = {
            filename: shortpath,
            extension,
            id,
            path: pagepath,
        };

        if (processors) {
            for (let [key, f] of Object.entries(processors)) {
                entry[key] = await f({ filename });
            }
        }
        if (postprocess) {
            await postprocess({ filename, entry });
        }

        entries.push(entry);
    }
    return entries;
}


const fsp = require("fs").promises;

async function postProcessComponent({ filename, entry }) {
    entry.text = await fsp.readFile(filename, 'utf8');
    entry.parsed = parseES6(entry.text);
}

async function scanDatabase(databaseName) {
    const database = {};

    database.properties = {
        path: `data/${databaseName}`,
    };

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
        postprocess: postProcessComponent,
    });

    const words = {};
    database.pages.forEach((page) => {
        visit(page.ast, 'text', node => {
            let s = node.value;
            if (!s) {
                return;
            }
            s = s.replace(/[!?.,()\"\'{}\/&^*@:]/g, ' ');

            s.trim().split(/\s+/g).forEach((word) => {
                word = word.trim().toLowerCase();
                if (word.length === 0 || !word.match(/[a-z]/i)) {
                    return;
                }
                words[word] = words[word] || {};
                words[word][page.id] = true;
            });
        });
    });

    // Rather than blacklist common words like "this", "that", "to", instead filter any
    // word that's being used in over a third of the pages: the intention of this list is
    // to highlight interesting commonalities between pages. If over 1/3rd of the pages
    // reference something, it's difficult to say it's calling out an "interesting" bit of
    // information.
    _.each(words, (value, key) => {
        const list = Object.keys(value);
        if (list.length > 1 && list.length < database.pages.length / 3) {
            words[key] = list.sort();
        } else {
            delete words[key];
        }
    });
    database.index_words = words;

    return database;
}


(async () => {
    const database = await scanDatabase("ridley");
    console.log('Rebuilt database');
    fs.writeFileSync('./src/database.json', JSON.stringify(database, null, 4));
})();

