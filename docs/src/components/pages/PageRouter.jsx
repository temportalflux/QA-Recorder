import React from 'react';
import PropTypes from 'prop-types';
import Sidebar from "../Sidebar/Sidebar";
import {Route} from "react-router-dom";
import * as shortid from "shortid";

export const PageRouter = (props) => {
    const { style, routes } = props;
    return (
        <div style={style.container}>
            <Sidebar
                style={props.sidebar.style}
                header={props.sidebar.header}
                menu={props.sidebar.menu}
                content={props.sidebar.content}
                componentMenu={props.sidebar.componentMenu}
            />
            <div style={style.main}>
                {Object.keys(routes).map((routePath) => {
                    return (
                        <Route
                            key={shortid.generate()}
                            path={routePath}
                            render={routes[routePath]}
                        />
                    );
                })}
            </div>
        </div>
    );
};

PageRouter.defaultProps = {
    style: {
        container: undefined,
        main: undefined,
    },
    sidebar: {
        style: undefined,
        main: {},
        content: {},
    },
};

PageRouter.propTypes = {

    style: PropTypes.object,
    sidebar: PropTypes.object,

};