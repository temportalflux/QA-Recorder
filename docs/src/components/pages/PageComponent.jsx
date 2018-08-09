import React from 'react';
import PropTypes from 'prop-types';
import {Grid} from "semantic-ui-react";
import {PageComponentPropsList} from "./PageComponentPropsList";
import {PageComponentHeader} from "./PageComponentHeader";

export class PageComponent extends React.Component {

    static Header = PageComponentHeader;
    static PropsList = PageComponentPropsList;

    render() {
        let { info } = this.props;
        let { displayName, description } = info;
        let seeTags = [];
        let repoURL = 'https://github.com/temportalflux/QA-Recorder';
        let repoPath = 'src/components/';
        console.log(info);
        return (
            <Grid padded>
                <Grid.Row>
                    <Grid.Column>
                        <PageComponentHeader
                            displayName={displayName}
                            description={description}
                            seeTags={seeTags}
                            repoURL={repoURL}
                            repoPath={repoPath}
                        />
                        <PageComponentPropsList
                            properties={info.props}
                        />
                    </Grid.Column>
                </Grid.Row>

                {/*
                <Grid.Row columns='equal'>
                    <Grid.Column>
                        <div ref={this.handleExamplesRef}>
                            <ComponentExamples
                                displayName={displayName}
                                examplesExist={componentInfo.examplesExist}
                                type={componentInfo.type}
                            />
                        </div>
                        <div style={exampleEndStyle}>
                            This is the bottom <Icon name='pointing down' />
                        </div>
                    </Grid.Column>
                    <Grid.Column computer={5} largeScreen={4} widescreen={4}>
                        <ComponentSidebar
                            activePath={activePath}
                            examplesRef={examplesRef}
                            onItemClick={this.handleSidebarItemClick}
                            sections={sidebarSections}
                        />
                    </Grid.Column>
                </Grid.Row>
                */}
            </Grid>
        );
    }

}

PageComponent.defaultProps = {

};

PageComponent.propTypes = {
    info: PropTypes.object.isRequired,
};
