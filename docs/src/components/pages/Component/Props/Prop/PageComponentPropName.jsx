import PropTypes from 'prop-types'
import React from 'react'
import {Icon, Popup} from 'semantic-ui-react'

export const PageComponentPropName = ({name, required}) => (
    <div>
        <code>{name}</code>
        {required && (
            <Popup
                content='Required'
                inverted
                position='right center'
                size='tiny'
                trigger={<Icon color='red' name='asterisk' size='small'/>}
            />
        )}
    </div>
);

PageComponentPropName.propTypes = {
    name: PropTypes.string,
    required: PropTypes.bool,
};
