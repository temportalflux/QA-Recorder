import React from 'react';
import PropTypes from 'prop-types';
import {Grid, Icon} from "semantic-ui-react";
import {PageComponentPropsList} from "./Props/PageComponentPropsList";
import {PageComponentHeader} from "./PageComponentHeader";
import {ComponentExamples} from "./Examples/ComponentExamples";

const exampleEndStyle = {
    textAlign: 'center',
    opacity: 0.5,
    paddingTop: '50vh',
};

export class PageComponent extends React.Component {

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
                            properties={info.props || {}}
                        />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row columns='equal'>
                    <Grid.Column>
                        <div>
                            <ComponentExamples
                                examplesPath={`src/examples/test`}
                                displayName={'test'}//info.displayName}
                                examplesExist={true}
                            />
                        </div>
                        <div style={exampleEndStyle}>
                            This is the bottom <Icon name='pointing down' />
                        </div>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );
    }

}

PageComponent.defaultProps = {

};

PageComponent.propTypes = {
    info: PropTypes.object.isRequired,
};
