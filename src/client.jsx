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
            Anything you see that's incorrect, please let me know about by creating
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

function Section({ name, children }) {
    return (
        <section>
            <h2>{name}</h2>
            {children}
        </section>
    )
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
                    <p>
                        Build a pretty simple raytracer that:
                    </p>
                    <ul>
                        <li>Shows the basics of Rust</li>
                        <li>Is packaged as a library</li>
                        <li>Has a command-line interface (Rust native)</li>
                        <li>Has a WASM interface for direct Browser rendering</li>
                        <li>Has a server interface for Browser API calls</li>
                        <li>Is documented, benchmarked, tested, and all the good things</li>
                    </ul>
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
                <Section name={"Writing to an image"}>
                    <pre>{`
https://github.com/kornelski/lodepng-rust

[dependencies]
lodepng = "2.5.0"


use lodepng;

fn main() {
    println!("Hello, raytracer!");

    let width: usize = 512;
    let height: usize = 512;
    let mut buffer = vec![0u8; width * height * 4];
    for y in 0..height {
        for x in 0..width {
            let i = y * width + x;

            let dx = (x as i64 - (width / 2) as i64).abs();
            let dy = (y as i64 - (height / 2) as i64).abs();
            let d = (((dx * dx) + (dy * dy)) as f64).sqrt();
            let mut c64 = 255.0 - d * (255.0 / (width / 2) as f64);
            c64 = if c64 > 255.0 {
                255.0
            } else if c64 < 0.0 {
                0.0
            } else {
                c64
            };

            let c = c64 as u8;
            buffer[i * 4 + 0] = c;
            buffer[i * 4 + 1] = c;
            buffer[i * 4 + 2] = c;
            buffer[i * 4 + 3] = 255;
        }
    }
    let _ = lodepng::encode32_file("out.png", &buffer, width, height);

    println!("Done!");
}
`}
                    </pre>
                </Section>

                <Section name={"Adding baseline benchmarks"}>
                    <pre>{`
Yes! Do this early, not after! Measure but don't optimize yet.

https://bheisler.github.io/criterion.rs/book/getting_started.html

                `}</pre>
                </Section>

                <Section name={"Writing to an image"}>
                    <pre>{`
use lodepng;

struct RGBAF32 {
    r: f32,
    g: f32,
    b: f32,
    a: f32,
}

struct Frame {
    width: usize,
    height: usize,
}

fn clamp_to_byte(v: f32, min: u8, max: u8) -> u8 {
    return if v < min as f32 {
        min
    } else if v > max as f32 {
        max
    } else {
        v as u8
    };
}

fn trace_pixel(frame: &Frame, x: f32, y: f32) -> RGBAF32 {
    let half_width = (frame.width / 2) as f32;
    let half_height = (frame.height / 2) as f32;

    let dx = (x - half_width).abs();
    let dy = (y - half_height).abs();
    let d = ((dx * dx) + (dy * dy)).sqrt() / half_width;
    let mut c64 = 1.0f32 - d;
    c64 = c64.sqrt();

    let c = if c64 > 1.0 {
        1.0
    } else if c64 < 0.0 {
        0.0
    } else {
        c64
    };

    RGBAF32 {
        r: c,
        g: c,
        b: c,
        a: 1.0,
    }
}

fn main() {
    println!("Hello, raytracer!");

    let frame = Frame {
        width: 512,
        height: 512,
    };

    let mut buffer = vec![0u8; frame.width * frame.height * 4];
    for y in 0..frame.height {
        for x in 0..frame.width {
            let i = y * frame.width + x;

            let c = trace_pixel(&frame, x as f32, y as f32);
            buffer[i * 4 + 0] = clamp_to_byte(c.r * 255f32, 0, 255);
            buffer[i * 4 + 1] = clamp_to_byte(c.g * 255f32, 0, 255);
            buffer[i * 4 + 2] = clamp_to_byte(c.b * 255f32, 0, 255);
            buffer[i * 4 + 3] = clamp_to_byte(c.a * 255f32, 0, 255);
        }
    }
    let _ = lodepng::encode32_file("out.png", &buffer, frame.width, frame.height);

    println!("Done!");
}
                                        
                    `}</pre>
                </Section>

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
