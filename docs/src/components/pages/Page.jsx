import React from 'react';
import PropTypes from 'prop-types';
import {Container, Header} from "semantic-ui-react";
import {ProjectHeader} from "../Header/ProjectHeader";
import {PageComponent} from "./PageComponent";

export class Page extends React.Component {

    static Component = PageComponent;

    render() {
        return (
            <Container>
                <ProjectHeader title={this.props.projectInfo.title} subtitle={this.props.projectInfo.subtitle} />
                <Header>{this.props.title}</Header>
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
