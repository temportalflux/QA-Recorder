import React from 'react';
import PropTypes from 'prop-types';
import {Dimmer, Loader} from "semantic-ui-react";

export const Loading = (props) => {
    return (
        <Dimmer active inverted>
            <Loader inverted>
                {props.children}
            </Loader>
        </Dimmer>
    );
};

Loading.defaultProps = {};

Loading.propTypes = {};