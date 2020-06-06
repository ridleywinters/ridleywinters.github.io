import React from 'react';

import Disclaimer from '../disclaimer.jsx';
import CodeBlock from '../code_block.jsx'
import MarkdownBlock from '../markdown_block.jsx';

function Section({ name, children }) {
    return (
        <section>
            <h2>{name}</h2>
            {children}
        </section>
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



export default function RustRaytracer() {
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
                        <li>Is documented, benchmarked, tested, and all the good thingsexplor</li>
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
                    <MarkdownBlock text={`
\`\`\`
$ cargo new rust_raytracer --bin
$ cargo build
\`\`\`

\`\`\`
Add .gitignore
        /target/                    
\`\`\`
    
Makefile
        Link to zero-config musings                          
                    `} />


                </section>
                <section>
                    <h2>The main loop</h2>
                    <Todo>Clean this section up!</Todo>
                    <p>
                        Before getting into anything too interesting, let's start with a basic program to fill a buffer
                        with values to get some Rust basics out of the way. We'll be approaching raytracing by looping
                        over a buffer of pixels and determining the color for each, so using let's use this basic
                        pattern to get something going first. It's often easier and more enjoyable to improve working
                        code than try get everything in there all at once.
                    </p>
                    <CodeBlock language="rust">{`
fn main() {
    println!("Hello, raytracer!");

    // Create a rectangular buffer of characters. Loop over each element and determine what character
    // belong there. 
    let mut buffer = vec!['x'; 32 * 32];
    for y in 0..32 {
        for x in 0..32 {
            let i = y * 32 + x;
            buffer[i] = if (x%2) + (y%2) != 1 { '-' } else { '*' }
        }
    }
    
    // Loop over the buffer "row by row" and print to the console
    for y in 0..32 {
      let i = y * 32;
      let s : String = buffer[i..(i+32)].iter().map(|&c| c.to_string()).collect();
      println!("{}", s);
    }
}
`}</CodeBlock>
                    <h3>Output</h3>
                    <CodeBlock>{`
$ rustc -o main main.rs
$ ./main
Hello, raytracer!
-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
`}</CodeBlock>
                </section>
                <Section name={"Writing to an image"}>
                    <p>
                        We'll use <a href="https://github.com/kornelski/lodepng-rust">https://github.com/kornelski/lodepng-rust</a> to
                        handle the PNG encoding.
                    </p>
                    <CodeBlock language="toml">{`
[dependencies]
lodepng = "2.5.0"
                    `}</CodeBlock>
                    <CodeBlock language="rust">{`
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
                    </CodeBlock>
                </Section>

                <Section name={"Adding baseline benchmarks"}>
                    <pre>{`
Yes! Do this early, not after! Measure but don't optimize yet.

https://bheisler.github.io/criterion.rs/book/getting_started.html

                `}</pre>
                </Section>

                <Section name={"Writing to an image"}>
                    <CodeBlock language="rust">{`
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
                                        
                    `}</CodeBlock>
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