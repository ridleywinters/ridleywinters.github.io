import React from 'react';

export default function Disclaimer() {
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