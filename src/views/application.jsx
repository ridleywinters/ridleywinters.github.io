import React from "react";
import Router from '../base/routing/router.jsx';
import database from '../database.json';
import MDXPage from './mdx_page.jsx';
import _ from 'lodash';
import visit from "unist-util-visit";

function evaluateDefaultExport(source, additionalContext = {}) {
    const exports = {};
    const context = {
        ...additionalContext,
        exports,
        require: function (name) {
            switch (name) {
                case 'lodash': return _;
                case 'react': return React;
                default:
                    throw new Error(`Unknown module '${name}`);
            }
        },
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
        console.error(err);
        throw err;
    }
    return exports.default;
}

// NOTE: it's possible that these index generators should exist in the data directory
// as plug-ins and be generated server-side.  One complication is the indices won't be
// able to refer to the in-memory objects (which is inconvenient), but architecturally
// having "all" the data generated server-side seems more consistent.

database.index = {};

database.index.tag = (() => {
    const tagIndex = {};
    database.pages.forEach((page) => {
        page.tags.forEach((tag) => {
            tagIndex[tag] = tagIndex[tag] || [];
            tagIndex[tag].push(page);
        })
    });
    return tagIndex;
})();

database.index.rendererByType = {};
database.index.rendererByName = {};

database.components.forEach((comp) => {
    const type = comp.filename.replace(/\.jsx$/, '');
    const camel = type.substr(1).replace(/[_\-]+([a-z])/g, (_unused, letter) => {
        return letter.toUpperCase();
    });
    const name = `${type[0].toUpperCase()}${camel}`;


    let obj;
    try {
        obj = evaluateDefaultExport(`return ${comp.parsed};`, {});
    } catch (err) {
        console.error(`Error parsing component '${type}'`, err);
    }
    database.index.rendererByType[type] = obj;
    database.index.rendererByName[name] = obj;
});

database.pages.forEach((page) => {
    function visit(node, cb) {
        cb(node);
        if (node.children) {
            node.children.forEach((child) => {
                visit(child, cb);
            })
        }
    }

    page.name = {};
    visit(page.ast, (node) => {
        if (node.name) {
            page.name[node.name] = node;
        }
    });
})

export default function Application() {

    database.pages.forEach((page) => {
        page.href = `/?page=${page.id}`;
    });

    const routes = {};
    database.pages.forEach((page) => {
        routes[page.id] = () => <MDXPage database={database} page={page} />
    });

    const SiteLayout = database.index.rendererByName.SiteLayout;
    let siteLayoutProps = {};
    if (SiteLayout) {
        siteLayoutProps = {
            database,
        }
    } else {
        SiteLayout = React.Fragment;
    }

    return (
        <SiteLayout {...siteLayoutProps}>
            <Router
                routes={routes}
                defaultRoute={routes.home}
            />
        </SiteLayout>
    );
}