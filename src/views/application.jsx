import React from "react";
import Router from '../base/routing/router.jsx';
import Layout from './layout.jsx';
import RustRaytracer from './pages/rust_raytracer.jsx';
import database from '../database.json';
import MDXPage, { makeSeaComponent } from './mdx_page.jsx';



function evaluateDefaultExport(source, additionalContext = {}) {
    const exports = {};
    const context = {
        ...additionalContext,
        exports,
        require : function(name) {
            switch (name) {
                case 'react': return React;
                default: return null;
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

const Sea = makeSeaComponent(database);
database.components.forEach((comp) => {
    const obj = evaluateDefaultExport(`return ${comp.parsed};`, { Sea });
    const type = comp.filename.replace(/\.jsx$/, '');
    const camel = type.substr(1).replace(/[_\-]+([a-z])/g, (_unused, letter) => {
        return letter.toUpperCase();
    });
    const name = `${type[0].toUpperCase()}${camel}`;
    database.index.rendererByType[type] = obj;
    database.index.rendererByName[name] = obj;
})

console.log(database);

export default function Application() {
    
    database.pages.forEach((page) => {
        page.href = `/?page=${page.id}`;
    });

    const routes = {
        'challenges-rust_raytracer': () => <RustRaytracer />,
    };
    database.pages.forEach((page) => {
        routes[page.id] = () => <MDXPage database={database} page={page} />
    });    

    return (
        <Layout>
            <Router
                routes={routes}
                defaultRoute={routes.home}
            />
        </Layout>
    );
}