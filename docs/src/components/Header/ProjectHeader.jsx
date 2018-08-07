import React from 'react';
import PropTypes from 'prop-types';
import {Header, Segment} from "semantic-ui-react";
import {Logo} from "../Logo/Logo";

export const ProjectHeader = (props) => {
    if (props.inline) {
        return (
            <div>
                <Logo size='mini' inline/> &nbsp;
                <strong>
                    {props.title} &nbsp;
                    <small>
                        <em>{props.subtitle}</em>
                    </small>
                </strong>
            </div>
        );
    }
    else {
        return (
            <Segment basic textAlign='center'>
                <Logo centered size='small'/>
                <Header as='h1' textAlign='center'>
                    {props.title}
                    <Header.Subheader>{props.subtitle}</Header.Subheader>
                </Header>
            </Segment>
        );
    }
};

ProjectHeader.defaultProps = {
};

ProjectHeader.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
};