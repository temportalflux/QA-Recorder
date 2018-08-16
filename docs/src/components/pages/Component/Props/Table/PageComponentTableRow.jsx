import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {Table} from 'semantic-ui-react'
import {PageComponentPropName} from "../Prop/PageComponentPropName";
import {PageComponentPropDefaultValue} from "../Prop/PageComponentPropDefaultValue";
import {PageComponentPropDescription} from "../Prop/PageComponentPropDescription";
import {PageComponentPropFunctionSignature} from "../Prop/PageComponentPropFunctionSingature";

export class PageComponentTableRow extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showEnums: true,
        };
    }

    toggleEnums() {
        this.setState({ showEnums: !this.state.showEnums });
    }

    render() {
        const { defaultValue, description, name, required, tags, type/*, value*/ } = this.props;
        //const { showEnums } = this.state;
        //console.log(this.props);
        return (
            <Table.Row key={name}>
                <Table.Cell collapsing>
                    <PageComponentPropName name={name} required={required} />
                </Table.Cell>
                <Table.Cell collapsing>
                    <PageComponentPropDefaultValue value={defaultValue.value} />
                </Table.Cell>
                <Table.Cell collapsing>{`{${type.name}}`}</Table.Cell>
                <Table.Cell>
                    <PageComponentPropDescription description={description} />
                    <PageComponentPropFunctionSignature name={name} tags={tags} />
                    {/*
                    <PageComponentPropEnum
                        showAll={showEnums}
                        toggle={this.toggleEnums}
                        type={type}
                        values={value}
                    />
                    */}
                </Table.Cell>
            </Table.Row>
        )
    }
}

PageComponentTableRow.defaultProps = {
    defaultValue: { value: null },
};

PageComponentTableRow.propTypes = {
    defaultValue: PropTypes.shape({ value: PropTypes.string }),
    description: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    required: PropTypes.bool,
    tags: PropTypes.array,
    type: PropTypes.shape({ name: PropTypes.string.isRequired }).isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
};
