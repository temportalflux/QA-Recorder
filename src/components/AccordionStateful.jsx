import React from 'react';
import PropTypes from 'prop-types';
import {Accordion} from "semantic-ui-react";

export default class AccordionStateful extends React.Component {

    constructor(props) {
        super(props);

        this.handleClick = this.handleClick.bind(this);

        this.state = {
            activeIndex: -1,
        };
    }

    handleClick(e, titleProps) {
        const { index } = titleProps;
        const { activeIndex } = this.state;
        const newIndex = activeIndex === index ? -1 : index;
        this.setState({ activeIndex: newIndex });
    }

    render() {
        return (
            <Accordion styled>
                <Accordion.Title
                    index={0}
                    active={this.state.activeIndex === 0}
                    onClick={this.handleClick}
                >Formats</Accordion.Title>
                <Accordion.Content active={this.state.activeIndex === 0}>
                    {this.props.children}
                </Accordion.Content>
            </Accordion>
        );
    }

}

AccordionStateful.defaultProps = {};

AccordionStateful.propTypes = {};