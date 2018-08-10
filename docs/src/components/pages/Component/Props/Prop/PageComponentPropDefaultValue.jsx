import PropTypes from 'prop-types'
import React from 'react'
import * as lodash from 'lodash'

export const PageComponentPropDefaultValue = ({ value }) => {
    return lodash.isNil(value) ? null : <code>{value}</code>;
};

PageComponentPropDefaultValue.propTypes = {
    value: PropTypes.node,
};
