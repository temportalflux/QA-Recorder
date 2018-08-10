import React from 'react';
import PropTypes from 'prop-types';
import {Container} from "semantic-ui-react";
import {ProjectHeader} from "../Header/ProjectHeader";
import {PageComponent} from "./Component/PageComponent";
import Markdown from "react-markdown";

export class Page extends React.Component {

    static Component = PageComponent;

    render() {
        return (
            <Container>
                <ProjectHeader title={this.props.projectInfo.title} subtitle={this.props.projectInfo.subtitle} />
                <Markdown source={this.props.markdown} />
            </Container>
        );
    }

}

Page.defaultProps = {

};

Page.propTypes = {
    /**
     * The project information to display using ProjectHeader.
     */
    projectInfo: PropTypes.object.isRequired,
    /**
     * https://rexxars.github.io/react-markdown/
     */
    markdown: PropTypes.string.isRequired,
};
