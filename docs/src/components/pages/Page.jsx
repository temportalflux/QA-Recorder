import React from 'react';
import PropTypes from 'prop-types';
import {Container} from "semantic-ui-react";
import {ProjectHeader} from "../Header/ProjectHeader";

export class Page extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Container id='introduction-page'>
                <ProjectHeader title={this.props.projectInfo.title} subtitle={this.props.projectInfo.subtitle} />
                TODO: Fill with content
            </Container>
        );
    }

}

Page.defaultProps = {

};

Page.propTypes = {
    projectInfo: PropTypes.object.isRequired,

};