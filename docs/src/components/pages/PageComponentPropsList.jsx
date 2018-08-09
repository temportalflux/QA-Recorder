import React from 'react';
import PropTypes from 'prop-types';
import {Checkbox} from "semantic-ui-react";

// Based on https://github.com/Semantic-Org/Semantic-UI-React/blob/e786724c73a6446fc5e86828ba446c18d4a9baab/docs/src/components/ComponentDoc/ComponentProps/ComponentProps.js
export class PageComponentPropsList extends React.Component {

    constructor(props) {
        super(props);

        this.handleToggle = this.handleToggle.bind(this);

        this.state = {
            isActive: false,
        };
    }

    handleToggle() {
        this.setState({
            isActive: !this.state.isActive,
        });
    }

    render() {
        // toggleable header bar
        // table of props
        return (
            <div>
                <Checkbox slider checked={this.state.isActive} label='Props' onClick={this.handleToggle} />
            </div>
        );
    }

}

PageComponentPropsList.defaultProps = {};

PageComponentPropsList.propTypes = {
    properties: PropTypes.object.isRequired,
};
