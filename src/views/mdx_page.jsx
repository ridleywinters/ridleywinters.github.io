import React from 'react';
import unified from 'unified';
import remark2react from 'remark-react';
import CodeBlock from './code_block.jsx';
import _ from 'lodash';

function MDXLayout({ children }) {
    return (
        <div
            style={{
                margin: '0 auto',
                maxWidth: '80rem',
            }}
        >
            <div
                style={{
                    margin: '0 2rem',
                }}
            >
                {children}
            </div>
        </div>
    );
}

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
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z">
            </path>
        </svg>
    );
}

function MDXLink({ href, children }) {

    if (href.match(/github\.com/)) {
        return (
            <div style={{ display: 'inline-block' }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                }}>
                    <a href={href}>{children}</a>
                    <GitHubIcon style={{ paddingLeft: '4px' }} />
                </div>
            </div>
        )
    }

    return (
        <a href={href}>{children}</a>
    )
}

function MDXCodeBlock({ language, value }) {
    return (
        <CodeBlock language={language}>{value}</CodeBlock>
    );
}

function MDXEvalBlock({ db, language, value, value2 }) {


    const context = {
        database: db,
        _,
        React,
        MDXLink,
        console,
    };
    const contextKeys = Object.keys(context);
    const contextValues = contextKeys.map((key) => context[key]);

    try {
        const f = new Function(...contextKeys, `return ${value2}`);
        const e = f(...contextValues);
        return e;
    } catch (err) {
        return (<pre>{JSON.stringify(err, null, 4)}</pre>);
    }
}

function MDXParagraph({ children }) {
    return (
        <div style={{
            margin: '0.5rem 0',
            lineHeight: '1.32rem',
        }}>
            {children}
        </div>
    )
}

function Status({
    database,
    page,
}) {
    switch (page.properties.status) {
        case 'placeholder':
            return (
                <div
                    style={{
                        margin: '0.5rem 0',
                        padding: '0.5rem 1rem',
                        border: 'solid 1px rgba(140,60,80, 0.25)',
                        borderRadius: '8px',
                        background: 'rgba(140,60,80, 0.25)',
                    }}
                >
                    <strong>Status: Placeholder</strong><br />
                    This article isn't ready! Just a reminder to myself that I wanted
                    to write about this topic.
                </div>
            );
        case 'draft':
            return (
                <div
                    style={{
                        margin: '0.5rem 0',
                        padding: '0.5rem 1rem',
                        border: 'solid 1px rgba(80,192,80, 0.25)',
                        borderRadius: '8px',
                        background: 'rgba(80,192,80, 0.25)',
                    }}
                >
                    <strong>Status: Draft</strong><br />
                    This article is still a work-in-progress. Take what is written here
                    with a grain of salt.
                    Please feel free to log a
                    {' '}<a href="https://github.com/ridleywinters/ridleywinters.github.io/issues">GitHub issue</a>{' '}
                    if you see a problem. Thank you!
                </div>
            );

        default:
            return null;
    }
}

/**
 * remark2react converts the mdast -> hast -> react components. Some data is lost in the
 * conversion through hast, for example the "language" on a code block.
 * 
 * It would likely be a more optimal path to process the MDX AST directly via 
 * code similar to react-remark, but for the time being, I'm optimizing for getting
 * something working using existing libraries over optimal code.
 * 
 */
export default function MDXPage({
    database,
    page,
}) {
    const components = unified()
        .use(remark2react, {
            // Don't strip out unrecognized properties because we're intentionally extending 
            // standard markdown syntax.
            sanitize: false,

            // The default Hast handler drops the language tag, so add a custom
            // processor
            toHast: {
                handlers: {
                    wikilink: (h, node) => {
                        let match = _.find(database.pages, (page) => page.id == node.id);

                        // Link to Github to create a new file if there is not a match.
                        // An inexpensive way to create a wiki.
                        let href;
                        if (match) {
                            href = `/?page=${node.id}`;
                        } else {
                            const repo = `ridleywinters/ridleywinters.github.io`;
                            const dbpath = 'data/ridley'
                            href = `https://github.com/${repo}/new/master/${dbpath}/pages?filename=${node.id}.mdx`;
                        }


                        return {
                            type: 'element',
                            tagName: 'a',
                            properties: {
                                href,
                            },
                            children: [
                                { type: 'text', value: node.text }
                            ]
                        }
                    },
                    code: (h, node) => {

                        if (node.lang === 'eval-jsx') {
                            return {
                                type: 'element',
                                tagName: 'evalblock',
                                properties: {
                                    language: node.lang,
                                    value: node.value,
                                    value2: node.value2,
                                    db: database,
                                },
                                children: [],
                            };
                        }

                        return {
                            type: 'element',
                            tagName: 'codeblock',
                            properties: {
                                language: node.lang,
                                value: node.value,
                            },
                            children: [],
                        };
                    }
                },
            },
            // Hook into the createElement as this makes the mapping from 
            // HAST -> React more transparent (while retaining some of the
            // clean-up remark-react does).
            createElement: (tag, props, children) => {

                if (tag === 'codeblock') {
                    console.log(tag, props, children)
                }

                tag = {
                    a: MDXLink,
                    p: MDXParagraph,
                    codeblock: MDXCodeBlock,
                    evalblock: MDXEvalBlock,
                }[tag] || tag;

                return React.createElement(tag, props, children);
            },
        })
        .stringify(page.ast)
        ;

    document.title = page.title;
    return (
        <MDXLayout>
            <Status database={database} page={page} />
            <div>{components}</div>
        </MDXLayout>
    )
}