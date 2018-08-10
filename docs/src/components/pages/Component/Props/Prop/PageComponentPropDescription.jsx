import * as lodash from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'

export const PageComponentPropDescription = ({ description }) => (
    <p>{lodash.map(description, line => [line, <br key={line} />])}</p>
);

PageComponentPropDescription.propTypes = {
    description: PropTypes.string.isRequired,
};
