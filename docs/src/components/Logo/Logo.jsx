import React from 'react';
import {Image} from "semantic-ui-react";

export const Logo = (props) => {
    return (
        <Image src={'/logo.png'} {...props} />
    );
};

Logo.defaultProps = {};

Logo.propTypes = {};