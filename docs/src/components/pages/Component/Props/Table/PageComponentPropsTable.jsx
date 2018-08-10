import * as lodash from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Table } from 'semantic-ui-react'

import {PageComponentTableHeader} from './PageComponentTableHeader'
import {PageComponentTableRow} from './PageComponentTableRow'

/**
 * Displays a table of a Component's PropTypes.
 */
const ComponentTable = ({props}) => {
    console.log(props);
    return (
        <Table compact='very' basic='very'>
            <PageComponentTableHeader />
            <Table.Body>
                {lodash.toPairs(props).map(([propName, propDef]) => {
                    return (
                        <PageComponentTableRow key={propName} name={propName} {...propDef} />
                    );
                })}
            </Table.Body>
        </Table>
    )
};

ComponentTable.propTypes = {
    props: PropTypes.object.isRequired,
};

export default ComponentTable
