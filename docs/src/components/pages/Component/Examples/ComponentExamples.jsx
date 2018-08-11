import PropTypes from 'prop-types'
import React, { Component, createElement } from 'react'

import { Grid } from 'semantic-ui-react'
import {ContributionPrompt} from './ContributionPrompt'

export class ComponentExamples extends Component {

    renderExamples() {
        return createElement(require(`../../../../examples/${this.props.displayName}/index.jsx`).default);
    }

    renderMissingExamples() {
        return (
            <Grid padded>
                <Grid.Column>
                    <ContributionPrompt repoUrl={''}>
                        Looks like we're missing <code>{`<${this.props.displayName} />`}</code> examples.
                    </ContributionPrompt>
                </Grid.Column>
            </Grid>
        )
    }

    render() {
        const { examplesExist } = this.props;

        return examplesExist ? this.renderExamples() : this.renderMissingExamples()
    }

}

ContributionPrompt.propTypes = {
    displayName: PropTypes.string.isRequired,
    examplesExist: PropTypes.bool.isRequired,
};
