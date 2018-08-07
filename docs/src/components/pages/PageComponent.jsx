import React from 'react';
import PropTypes from 'prop-types';
import {Checkbox, Grid, Header, List} from "semantic-ui-react";
import * as lodash from 'lodash';
import { Link } from 'react-static';

const linkListStyle = {
    background: '#f7f7f7',
    boxShadow: '0 0 1em 0.5em #f7f7f7',
    margin: '0.5em',
    padding: '0.5em',
    position: 'absolute',
    right: '0',
    top: '0',
};

export default class PageComponent extends React.Component {

    constructor(props) {
        super(props);
    }

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
                        <Header
                            as='h1'
                            content={displayName}
                            subheader={lodash.join(description, ' ')}
                        />
                        <List horizontal link size='small' style={{ display: 'block' }}>
                            {/* Heads up! Still render empty lists to reserve the whitespace */}
                            <List.Item>
                                <Header color='grey' content={seeTags.length > 0 ? 'See:' : ' '} size='tiny' />
                            </List.Item>
                            {lodash.map(seeTags, ({ displayName, to }) => (
                                <List.Item as={Link} content={displayName} key={displayName} to={to} />
                            ))}
                        </List>
                        <List link style={linkListStyle}>
                            <List.Item
                                content={
                                    <code>
                                        <a href={`${repoURL}/blob/master/${repoPath}`} target='_blank' rel='noopener noreferrer'>
                                            {repoPath}
                                        </a>
                                    </code>
                                }
                                icon='github'
                            />
                        </List>
                        {/* https://github.com/Semantic-Org/Semantic-UI-React/blob/e786724c73a6446fc5e86828ba446c18d4a9baab/docs/src/components/ComponentDoc/ComponentProps/ComponentProps.js */}
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