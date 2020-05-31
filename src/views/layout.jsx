import React from "react";

export default function Layout({ children }) {
    return (
        <div>
            <div style={{
                padding: '12px 2rem 6px',
                backgroundColor: '#ACF',
            }}>
                <a href="/">home</a>
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