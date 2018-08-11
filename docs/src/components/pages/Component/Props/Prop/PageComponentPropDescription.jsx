import PropTypes from 'prop-types'
import React from 'react'

export const PageComponentPropDescription = ({ description }) => (
    <p>{description}</p>
);

PageComponentPropDescription.propTypes = {
    description: PropTypes.string.isRequired,
};
