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

function makeSeaComponent(database, page) {
    if (!database) {
        throw new Error('Called without a valid database object');
    }
    if (!page) {
        throw new Error('Called without a valid page object');
    }

    const Sea = ({ tree }) => {
        if (typeof tree === 'string') {
            return (<span>{tree}</span>);
        }
        return renderComponents(database, tree, page);
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

function MDXObject({
    database,
    page,
    Sea,
    kind,
    value,
}) {

    if (!database) {
        throw new Error('MDXObject called without a valid database object')
    }

    value.database = value.database || database;
    value.page = value.page || page;
    value.Sea = value.Sea || Sea;

    const Delegate = database.index.rendererByType[kind];
    if (Delegate) {
        // https://stackoverflow.com/questions/43356073/how-to-set-displayname-in-a-functional-component-react
        Delegate.displayName = kind;

        try {
            return <Delegate {...value} />;
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div>
            <h4>Object: {kind}</h4>
            <pre style={{ fontSize: '80%' }}>{JSON.stringify(value, null, 4)}</pre>
        </div>
    )
}

function renderComponents(database, root, page) {
    if (!database) {
        throw new Error('renderComponents called without a valid database object')
    }
    if (!page) {
        console.warn(`Page not specified`, new Error().stack);
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

                    //
                    // ```@object -> kind
                    // YAML content -> value
                    // ```
                    object: (h, node) => {
                        return {
                            type: 'element',
                            tagName: 'object-proxy',
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
                        let url = node.url;
                        if (node.url &&
                            !node.url.match(/^([a-zA-z]+):?\/\//) &&
                            !node.url.match(/^\//)
                        ) {
                            let subPath = '';
                            if (page) {
                                subPath = `${page.path.join('/')}/`;
                            }
                            url = `${database.properties.path}/pages/${subPath}${node.url}`;
                        }

                        return {
                            type: 'element',
                            tagName: 'img',
                            properties: {
                                title: node.title,
                                src: url,
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

                
                

                // Remap any elements that Sea has custom renderers for.
                const CustomComponent = {
                    a: MDXLink,
                    p: MDXParagraph,
                    'code-proxy': MDXCodeBlock,
                    'object-proxy': MDXObject,
                    'jsx-proxy': MDXJSX,
                }[tag];

                // Inject the current context into any elements with customer handlers
                if (CustomComponent) {
                    props = props || {};
                    props.database = props.database || database;
                    props.page = props.page || page;
                    props.Sea = makeSeaComponent(database, page);

                    return React.createElement(CustomComponent, props, children);
                }
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
    const Layout = database.index.rendererByName.PageLayout || React.Fragment;

    document.title = page.title;

    return (
        <Layout>
            <div>{renderComponents(database, page.ast, page)}</div>
            <RelatedArticles database={database} page={page} />
        </Layout>
    )
}