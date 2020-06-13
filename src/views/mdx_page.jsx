import React from 'react';
import unified from 'unified';
import remark2react from 'remark-react';
import CodeBlock from './code_block.jsx';
import _ from 'lodash';


function MDXLink({ href, children }) {
    return (
        <a href={href}>{children}</a>
    )
}

// Should this be moved to be a component? The render name would just need to 
// map to the standard MDAST specification name.
function MDXCodeBlock({ language, value }) {
    return (
        <CodeBlock language={language}>{value}</CodeBlock>
    );
}

export function makeSeaComponent(database) {
    if (!database) {
        throw new Error('MDXEvalBlock called without a valid database object');
    }

    const Sea = ({ tree }) => {
        if (typeof tree === 'string') {
            return (<span>{tree}</span>);
        }
        return renderComponents(database, tree);
    }
    return Sea;
}


function MDXEvalBlock({ db, value2 }) {
    if (!db) {
        throw new Error('MDXEvalBlock called without a valid database object')
    }


    // Set up the default context. As convenience is a priority, we populate (pollute?) the
    // default context for JSX to include:
    // * The database
    // * The page itself (TODO)
    // * React and Lodash
    // * All core Renderers
    // * All custom Renderers
    //
    // NOTE: it's worth considering for the future if these should be accessible but
    // hidden behind a require/import statement so that the React code is not "special"
    // and theoretically would work in other contexts as well. (This is a weak argument
    // though since file paths, package names, and reliance on the database itself
    // complicate the idea of direct reusability in more than just theory.)
    const context = {
        database: db,
        _,
        React,
        MDXLink,
        console,
    };
    _.each(db.index.rendererByName, (value, key) => {
        context[key] = value;
    });

    const contextKeys = Object.keys(context);
    const contextValues = contextKeys.map((key) => context[key]);
    try {
        const f = new Function(...contextKeys, `return ${value2}`);
        const e = f(...contextValues);
        return e;
    } catch (err) {
        return (
            <div style={{ padding: '1rem', border: 'solid 2px red' }}>
                <div>
                    <strong>Error: {`${err}`}</strong>
                </div>
                <pre>{JSON.stringify(err, null, 4)}</pre>
            </div>
        );
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

function RelatedArticles({ database, page }) {

    const pages = _.keyBy(database.pages, 'id');

    // This absurd functional chain is taking the set of keywords on this
    // page and unioning it with the set of pages that also have that keyword.
    const related = _.chain(database.index_words)
        .map((list, word) => {
            for (let i = 0; i < list.length; i++) {
                if (list[i] === page.id) {
                    return word;
                }
            }
            return null;
        })
        .compact()
        .sort()
        .uniq()
        .map((word) => database.index_words[word])
        .flatten()
        .compact()
        .sort()
        .filter((id) => id !== page.id)
        .uniq()
        .value();

    return (
        <div
            style={{
                margin: '8rem 0 2rem'
            }}
        >
            <h3>Similar pages</h3>
            <div>
                {_.map(related, (id, index) => (
                    <span key={id}>
                        <MDXLink href={`/?page=${id}`}>{pages[id].title}</MDXLink>
                        {index + 1 < related.length
                            ?
                            <span style={{ paddingRight: '0.5rem' }}>,</span>
                            :
                            null
                        }
                    </span>
                ))}
            </div>
        </div>
    );
}

function MDXJSX(props) {
    return (
        MDXEvalBlock({
            db: props.database,
            value2: props.parsed,
        })
    );
}

function MDXObject({ database, kind, value }) {

    if (!database) {
        throw new Error('MDXObject called without a valid database object')
    }

    function Sea({ tree }) {
        return renderComponents(database, tree);
    }

    value.renderComponents = renderComponents;
    value.Sea = Sea;

    const Delegate = database.index.rendererByType[kind];
    if (Delegate) {
        return <Delegate {...value} />;
    }

    return (
        <div>
            <h4>Object: {kind}</h4>
            <pre style={{ fontSize: '80%' }}>{JSON.stringify(value, null, 4)}</pre>
        </div>
    )
}

function renderComponents(database, root) {
    if (!database) {
        throw new Error('renderComponents called without a valid database object')
    }

    return unified()
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
                        let title = node.text || node.id;
                        if (match) {
                            href = `/?page=${node.id}`;
                            title = node.text || match.title || node.id;
                        } else {
                            const repo = `ridleywinters/ridleywinters.github.io`;
                            const dbpath = 'data/ridley'
                            href = `https://github.com/${repo}/new/master/${dbpath}/pages/q?filename=${node.id}.mdx`;
                        }


                        return {
                            type: 'element',
                            tagName: 'a',
                            properties: {
                                href,
                            },
                            children: [
                                { type: 'text', value: title }
                            ]
                        }
                    },
                    object: (h, node) => {
                        return {
                            type: 'element',
                            tagName: 'mdxobject',
                            properties: {
                                kind: node.kind,
                                value: node.value,
                            },
                        };
                    },
                    code: (h, node) => {
                        // Rename this to avoid the default processing to HAST, which loses the language
                        // information so custom syntax highlighting is harder. There may be a cleaner
                        // way to do this.
                        return {
                            type: 'element',
                            tagName: 'code-proxy',
                            properties: {
                                language: node.lang,
                                value: node.value,
                            },
                            children: [],
                        };
                    },
                    jsx: (h, node) => {
                        // NOTE: this is a workaround. This prevents remark-react from consuming
                        // the JSX node before createElement is called so that it makes it untouched
                        // the custom createElement handler.
                        return {
                            type: 'element',
                            tagName: 'jsx-proxy',
                            properties: { ...node },
                            children: node.children,
                            value: node.value,
                        }
                    },
                    image: (h, node) => {
                        // TODO: this feels fragile.  We're hosting as a single-page webapp but want
                        // the raw markdown images references to work as well. The approach here is
                        // to remap the url.
                        if (node.url &&
                            !node.url.match(/^([a-zA-z]+):?\/\//) &&
                            !node.url.match(/^\//)
                        ) {
                            node.url = `${database.properties.path}/pages/${node.url}`;
                        }

                        return {
                            type: 'element',
                            tagName: 'img',
                            properties: {
                                title: node.title,
                                src: node.url,
                                alt: node.alt,
                            },
                            children: [],
                        }
                    }
                },
            },
            // Hook into the createElement as this makes the mapping from 
            // HAST -> React more transparent (while retaining some of the
            // clean-up remark-react does).
            createElement: (tag, props, children) => {

                if (tag === 'mdxobject' || tag === 'jsx-proxy') {
                    props = props || {};
                    props.database = props.database || database;
                }

                tag = {
                    a: MDXLink,
                    p: MDXParagraph,
                    'code-proxy': MDXCodeBlock,
                    mdxobject: MDXObject,
                    'jsx-proxy': MDXJSX,
                }[tag] || tag;


                return React.createElement(tag, props, children);
            },
        })
        .stringify(root);


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
    console.log(database)

    const Layout = database.index.rendererByName.PageLayout || React.Fragment;

    document.title = page.title;

    return (
        <Layout>
            <Status database={database} page={page} />
            <div>{renderComponents(database, page.ast)}</div>
            <RelatedArticles database={database} page={page} />
        </Layout>
    )
}