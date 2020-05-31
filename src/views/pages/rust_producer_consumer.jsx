import React from 'react';

import Disclaimer from '../disclaimer.jsx';
import CodeBlock from '../code_block.jsx'

function GitHubIcon({ size = 16, style = {} }) {
    return (
        <svg
            style={style}
            height={size}
            viewBox="0 0 16 16"
            version="1.1"
            width={size}
            aria-hidden="true">
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z">
            </path>
        </svg>
    );
}

export default function RustProducerConsumer() {
    return (
        <div>
            <Disclaimer />
            <div style={{
                margin: '0 auto',
                maxWidth: '60rem',
            }}>
                <h1>Multithreaded Producer-Consumer Pattern in Rust</h1>
                <p style={{
                    display: 'flex',
                    flexDirection: 'row',
                }}>
                    See the <a style={{ paddingLeft: '0.25rem' }} href="https://github.com/ridleywinters/rust-producer-consumer">full repository here</a>
                    <GitHubIcon style={{ paddingLeft: '4px' }} />.
            </p>
                <h2>Context</h2>
                <p>
                    As part of the <a href="/?page=challenges-rust_raytracer">Rust Raytracer</a>, I've
                    been looking into leaning how to do multithreaded programming in Rust. The scenario
                    I have in mind is to split the render buffer into tiles and let separate threads
                    render each time, where the number of worker threads is a variable.
                </p>
                <p>
                    This requires some mechanism where a pool of threads is created, the tiles are
                    dispatched to the threads awaiting work (i.e. some simple
                    <a href="https://en.wikipedia.org/wiki/Scheduling_(computing)#Scheduling_disciplines">scheduling algorithm</a>),
                    the tiles then rendered to a memory buffer, that then is passed back to the main
                    thread to be copied into the main buffer.
                </p>
                <h2>Source code</h2>
                <h3>TODO</h3>
                <ul>
                    <li>How do I generalize this for more than just i32?</li>
                    <li>How do shared blocks of memory work?</li>
                </ul>
                <CodeBlock language="rust">{`
use rand::seq::SliceRandom;
use rand::thread_rng;
use std::sync::mpsc::{channel, Receiver, Sender};
use std::thread;

fn create_thread_pool(thread_count: usize) -> (Vec<Sender<i32>>, Receiver<i32>) {
    // Create a vector of Senders, one for each worker thread that is created.
    // This is used to send work requests to the worker thread from the parent.
    let mut pool_tx = Vec::new();

    // Create the parent channel, which is used for the worker threads to
    // send finished work back.
    let (parent_tx, parent_rx): (Sender<i32>, Receiver<i32>) = channel();

    // Create the pool of threads
    for id in 0..thread_count {
        let tx = Sender::clone(&parent_tx);
        let (thread_tx, thread_rx) = channel();
        pool_tx.push(thread_tx);

        // Give the thread a cloned handle to the send the result of its work
        // to the parent thread.

        thread::spawn(move || {
            println!("Starting thread {}...", id);
            // Loop over potentially multiple requests
            while let Ok(num) = thread_rx.recv() {
                thread::sleep(std::time::Duration::from_millis((15 * num) as u64));
                tx.send(num).unwrap()
            }
            println!("Ending thread {}.", id);
        });
    }
    // Remove the "outer" reference to the parent Sender. If this reference is left
    // open, then receiving channel will not close even after all threads complete.
    drop(parent_tx);

    (pool_tx, parent_rx)
}

fn main() {
    let (mut pool_tx, parent_rx) = create_thread_pool(16);

    // Send the work requests to the threads. Clear the vector as soon as all the
    // work has been sent to let the worker threads know finish.
    let mut rng = thread_rng();
    let mut a = (0..100).collect::<Vec<usize>>();
    a.shuffle(&mut rng);
    for i in a {
        let tx = &pool_tx[i % pool_tx.len()];
        let value = (i * 2) as i32;
        tx.send(value).unwrap();
    }
    pool_tx.clear();

    let mut count = 0;
    for received in parent_rx {
        count += 1;
        println!("Received ({} total): value = {}", count, received);
    }
}
`}</CodeBlock>
            </div>
        </div>
    );
}