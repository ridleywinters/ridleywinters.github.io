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
                minHeight: 'calc(100vh - 120px)'
            }}
            >{children}
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

export default function PageLayout({ children }) {
    
    return (
        <Outer>
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
        </Outer>
    );
}

