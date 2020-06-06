import React from "react";
import Router from '../base/routing/router.jsx';
import Layout from './layout.jsx';
import RustRaytracer from './pages/rust_raytracer.jsx';
import database from '../database.json';
import MDXPage from './mdx_page.jsx';

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