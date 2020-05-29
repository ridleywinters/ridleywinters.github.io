import React from "react";
import ReactDOM from "react-dom";
import Router from './base/routing/router.jsx'

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
                            </ul>
                        </li>
                        <li>Hobby Projects</li>
                        <li>How To's</li>
                        <li>Musings</li>
                        <li>Product Thoughts</li>
                        <li>Every Day Routine (EDR)</li>
                    </ul>
                    <div>
                        Twitter: <a href="https://twitter.com/RidleyWinters">RidleyWinters</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Disclaimer() {
    return (
        <div
            style={{
                padding: '1rem',
                border: 'solid 1px rgba(80,192,80, 0.25)',
                background: 'rgba(80,192,80, 0.25)',
            }}
        >
            I'm still learning so please take any information here with a grain of salt.
            Anything you see that's incorrect, please let me know about as
            a <a href="https://github.com/ridleywinters/ridleywinters.github.io/issues">GitHub issue</a>.
            Thank you!
        </div>
    )
}

function Todo({ children }) {
    return <div
        style={{
            padding: '1rem',
            border: 'solid 1px rgba(192,192,80, 0.25)',
            background: 'rgba(192,192,80, 0.25)',
        }}
    >
        <h3>TODO</h3>
        <div>
            {children}
        </div>
    </div>
}

function RustRaytracer() {
    return (
        <div>
            <Disclaimer />
            <div style={{
                maxWidth: '80rem',
                margin: '1rem auto 8rem',
            }}>
                <section>
                    <h1>Rust Raytracer (Work-in-Progress!)</h1>
                </section>
                <section>
                    <h2>Goals</h2>
                </section>
                <section>
                    <h2>Prerequisites</h2>
                    <ul>
                        <li>Assumes you are comfortable with basic bash, Makefiles, and code editing</li>
                        <li>Assumes you have a recent version of Rust installed</li>
                    </ul>
                </section>
                <section>
                    <h2>Basic setup</h2>
                    <p>
                        We'll move quickly through this section of the challenge as the goal is writing the
                        raytracer, not setting up the Rust toolchain.
                    </p>
                    <pre>{`
$ cargo new rust_raytracer --bin
$ cargo build

Add .gitignore
        /target/                    

    
Makefile
        Link to zero-config musings        
`}</pre>

                </section>
                <section>
                    <h2>The main loop</h2>
                    <Todo>Clean this section up!</Todo>
                    <pre>{`
fn main() {
    println!("Hello, raytracer!");

    let mut buffer = vec!['x'; 512 * 512];
    for y in 0..512 {
        for x in 0..512 {
            let i = y * 512 + x;
            buffer[i] = if (x + y) % 2 == 0 { '-' } else { '*' }
        }
    }
    println!("{:?}", buffer)
}
`}</pre>
                </section>
                <section>
                    <h2>References</h2>
                    <ul>
                    </ul>
                </section>
            </div>
        </div>
    )
}


function Application() {
    return (
        <Router
            routes={{
                'challenges-rust_raytracer': () => <RustRaytracer />,
            }}
            defaultRoute={() => <HelloWorld name="Ridley" />}
        />
    );
}


ReactDOM.render(<Application />, document.getElementById("root"));
