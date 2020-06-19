import React from 'react';


function Outer({ children }) {
    return (
        <div>
            <div style={{                
                padding: '12px 2rem 6px',
                backgroundColor: '#ACF',
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    maxWidth: '80rem',
                margin: '0 auto',
                }}>
                    <a href="https://blacklivesmatter.com/" style={{ textDecoration: 'none' }}>🖤</a>                    
                    <div style={{ flexGrow: 1 }} />
                    <a style={{ flexGrow: 0 }} href="/">home</a>                   
                    <div style={{ flexGrow: 1 }} />
                    <a style={{ flexGrow: 0 }} href="/?page=index">index</a>
                    <div style={{ flexGrow: 50 }} />
                </div>
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: 'calc(100vh - 120px)'
            }}
            >
                {children}
            </div>
            <div style={{
                minHeight: '120px',
                padding: '12px 2rem 6px',
                backgroundColor: '#ACF',
            }}>
                <div>
                    Twitter: <a href="https://twitter.com/RidleyWinters">RidleyWinters</a>
                </div>
                <div>
                    Favicon designed by
                    {' '}<a href="https://www.flaticon.com/authors/good-ware">Good Ware</a>{' '}
                    available at
                    {' '}<a href="https://www.flaticon.com/free-icon/woodland_2933738?term=landscape&page=1&position=">flaticon</a>.
                </div>
            </div>
        </div>
    );
}


function RelatedPages({ database, page }) {

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
                        <a href={`/?page=${id}`}>{pages[id].title}</a>
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

export default function PageLayout({ 
    database,
    page,
    children ,
}) {
    
    return (
        <Outer>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    margin: '0 auto',
                    maxWidth: '80rem',                    
                }}
            >
                <div
                    style={{
                        flexGrow: 1,
                    }}
                >
                    {children}                    
                </div>
                <RelatedPages database={database} page={page} />
            </div>            
        </Outer>
    );
}

