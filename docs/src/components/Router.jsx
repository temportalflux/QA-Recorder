import React from 'react';
import PropTypes from 'prop-types';
import style from '../Style'
import * as shortid from "shortid";
import Sidebar from "./Sidebar/Sidebar";
import {Route, Switch} from "react-router-dom";

export const Router = (props) => {
    return (
        <div style={style.container}>
            <Sidebar
                style={style.menu}
                {...props.project}
            />
            <div style={style.main}>
                <Switch>
                    <Route exact path='/' {...props.routeMain} />
                    {props.routes.map((routeObj) => <Route key={shortid.generate()} {...routeObj} />)}
                    <Route {...props.routeError} />
                </Switch>
            </div>
        </div>
    );
};

Router.defaultProps = {};

Router.propTypes = {
    project: PropTypes.object.isRequired,
    routeMain: PropTypes.object.isRequired,
    routeError: PropTypes.object.isRequired,
    routes: PropTypes.array.isRequired,
};
