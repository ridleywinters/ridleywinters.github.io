import React from "react";
import Router from '../base/routing/router.jsx';
import Layout from './layout.jsx';
import RustRaytracer from './pages/rust_raytracer.jsx';
import database from '../database.json';
import MDXPage from './mdx_page.jsx';

function HelloWorld({ name }) {
    return (
        <div>
            <div style={{ maxWidth: '80rem', margin: '1rem auto' }}>
                <div style={{ margin: '1rem 1rem' }}>
                    <h1>Hello, {name}!</h1>
                    <p>
                        I'm Ridley Winters and this is my website where I share some my
                        software engineering hobby projects and tools. I'm a former
                        product manager and now part-time software engineer.  For my hobby
                        projects, I am focused on learning Deno and Rust - and a small side
                        obsession with Vulkan and WebGL.
                    </p>
                    <p>
                        <em>
                            I'm still learning so please take everything you find on this site with
                            a grain of salt.
                        </em>
                    </p>
                    <ul>
                        <li>About</li>
                        <li>
                            Tech Challenges
                            <ul>
                                <li>
                                    <a href="/?page=challenges-rust_raytracer">
                                        Writing a raytracer in Rust
                                    </a>
                                </li>
                                <li>Writing a raytracer in Deno</li>
                                <li>End-to-end Development of a Distributed System</li>
                                <li>
                                    <a href="/?page=rust_producer_consumer">
                                        Multithreaded Product-Consumer in Rust
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li>Hobby Projects</li>
                        <li>How To's</li>
                        <li>Musings</li>
                        <li>Product Thoughts</li>
                        <li>Every Day Routine (EDR)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}



export default function Application() {
    database.pages.forEach((page) => {
        page.href = `/?page=${page.id}`;
    });

    const routes = {
        'challenges-rust_raytracer': () => <RustRaytracer />,
    };
    database.pages.forEach((page) => {
        routes[page.id] = () => <MDXPage page={page} />
    });

    return (
        <Layout>
            <Router
                routes={routes}
                defaultRoute={() => <HelloWorld name="World" />}
            />
        </Layout>
    );
}