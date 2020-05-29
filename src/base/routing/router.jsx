import React from 'react';

/**
 * Replaces a the method named `method` on `object` with a modified 
 * version as specified by the `params` options.  Returns a function
 * that, when called, returns the object's method back to its prior
 * value.
 * 
 * Params
 * 
 * * params.prologue - a function to call before the base method is invoked
 * * params.epilogue - a function to call after the base method is invoked
 * 
 * Also note:
 * 
 * * External links (i.e. any href starting with a http/https) will open in 
 * a new window by default.
 */
function overrideMethod(object, method, params) {
    const original = object[method];
    object[method] = function (...args) {

        if (params.prologue) {
            params.prologue();
        }

        const ret = original.call(this, ...args);

        if (params.epilogue) {
            params.epilogue();
        }

        return ret;
    };

    return () => {
        object[method] = original;
    };
}

/**
 * A React Component that uses browser listeners and events to detect URL updates
 * and change which Components are rendered under it in the DOM tree.
 */
export default class Router extends React.Component {

    // Globally register the Router listeners once
    static listenerRegistrationCount = 0;

    state = {
        // A "meaningless" state value that, when changed, forces a rerender
        incarnation: 0,
    };

    // Undo any patching of pushState()
    _restorePushState = null;

    componentDidMount() {
        if (Router.listenerRegistrationCount === 0) {
            window.addEventListener('click', this._handleClick);
            window.addEventListener('popstate', this._handlePopState);
            window.addEventListener('hashchange', this._handleHashChange);

            // There is no standard DOM 'pushstate' event so override the global
            // history object's method. Overriding standard method behaviors is 
            // generally to be avoided (as unsuspecting users of the standard functions
            // will find it does not have the standard functionality), but I'm not
            // aware of a standard way to intercept these URL updates otherwise.
            this._restorePushState = overrideMethod(history, 'pushState', {
                epilogue: () => {
                    this._handlePushState();
                },
            });
        }
        Router.listenerRegistrationCount++;
    }

    shouldComponentUpdate() {
        return true;
    }

    componentWillUnmount() {
        Router.listenerRegistrationCount--;
        if (Router.listenerRegistrationCount === 0) {
            window.removeEventListener('click', this._handleClick);
            window.removeEventListener('popstate', this._handlePopState);
            window.removeEventListener('hashchange', this._handleHashChange);
            this._restorePushState();
        }
    }

    _handlePushState = () => {
        this._rerender();
    };

    _handlePopState = (evt) => {
        evt.preventDefault();
        this._rerender();
    }

    _handleHashChange = (evt) => {
    }

    /**
     * Globally intercept clicks so that <A/> tags can go straight to the
     * history object rather than to the browser, thus allowing this to act like
     * a single page web application.
     */
    _handleClick = (evt) => {
        // Walk up the tree to the nearest A element
        let node = evt.target;
        while (node && node.tagName !== 'A') {
            node = node.parentNode;
        }
        if (!node) {
            return;
        }

        const href = node.getAttribute('href');

        // Handle external links. Open them in a new tab
        if (href.match(/^https?:\/\//)) {
            // Ensure fully specificed (i.e. including protocol) links are opened in new windows
            evt.preventDefault();
            window.open(href);
            return;
        }

        // Internal links: prevent the normal click behavior and update the URL "directly"
        // without navigation away from the page.

        evt.preventDefault();

        // Use the standard DOM to do the parsing
        const {
            hash,
            pathname,
            search,
        } = node;

        this._updateBrowserURL({
            pathname,
            hash,
            search,
        });
    }

    // Helper to update the browser URL via a set of parameters
    _updateBrowserURL(params) {
        const keys = Object.keys(params);
        const url = new URL(window.location);
        const diff = {};
        let changes = 0;
        keys.forEach((key) => {
            if (url[key] !== params[key]) {
                changes++;
                diff[key] = [url[key], params[key]];
                url[key] = params[key];
            }
        });
        if (changes === 0) {
            return;
        }


        history.pushState(null, '', url.toString());
        if (changes === 1 && diff.hash !== undefined) {
            const elem = document.querySelector(`[name="${params.hash.replace(/^#/, '')}"`);
            if (elem) {
                elem.scrollIntoView({ behavior: 'smooth' });
            }

        } else {
            this._rerender();
        }
    }

    // Force a Component render
    _rerender() {
        this.setState((state) => {
            return { incarnation: state.incarnation + 1 };
        });
    }

    render() {
        const { routes, defaultRoute } = this.props;
        const url = new URL(window.location);
        const query = new URLSearchParams(url.searchParams);

        // Use '/?page=name-of-page' for navigation
        const page = query.get('page');
        if (routes[page]) {
            return routes[page]();
        }
        return defaultRoute();
    }
}