import React from "react";
import Router from '../base/routing/router.jsx';
import Layout from './layout.jsx';
import RustRaytracer from './pages/rust_raytracer.jsx';
import database from '../database.json';
import MDXPage from './mdx_page.jsx';

(() => {

    const tagIndex = {};
    database.pages.forEach((page) => {
        page.tags.forEach((tag) => {
            tagIndex[tag] = tagIndex[tag] || [];
            tagIndex[tag].push(page);
        })
    });
    database.index = {
        tag : tagIndex,
    };
})();

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

    database.renderers = {};
    database.components.forEach((comp) => {
        const obj = evaluateDefaultExport(`return ${comp.parsed};`);
        database.renderers[comp.filename.replace(/\.jsx$/, '')] = obj;
    })

    return (
        <Layout>
            <Router
                routes={routes}
                defaultRoute={routes.home}
            />
        </Layout>
    );
}