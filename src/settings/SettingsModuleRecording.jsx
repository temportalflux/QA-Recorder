import React from 'react';
import PropTypes from 'prop-types';
import {Form, Table} from "semantic-ui-react";
import ToggleSaved from "../components/ToggleSaved";
import BrowseBar from "../components/BrowseBar";
import InputSaved from "../components/InputSaved";
import * as shortid from "shortid";
import AccordionStateful from "../components/AccordionStateful";
import {FILENAME_FORMATS} from "./Settings";
import {GetLocalData} from "../singletons/LocalData";
import FileSystem from "../singletons/FileSystem";
import path from 'path';

function createTable(header, content) {
    let mapToCells = (items) => {
        return items.map((item) => {
            return (
                <Table.Cell key={shortid.generate()}>{item}</Table.Cell>
            );
        });
    };
    return (
        <Table>
            <Table.Header>
                <Table.Row>
                    {mapToCells(header)}
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {content.map((row) => {
                    return (
                        <Table.Row key={shortid.generate()}>
                            {mapToCells(row)}
                        </Table.Row>
                    );
                })}
            </Table.Body>
        </Table>
    );
}

export const SettingsModuleRecording = (props) => {
    let executable = GetLocalData().get('settings.application.executable', {});
    executable = Object.getOwnPropertyNames(executable).length > 0 ? FileSystem.resolvePlatformPath(executable): "";
    return (
        <div>

            <Form.Field disabled={props.shouldBeDisabled()}>
                <ToggleSaved
                    path={`${props.path}.enabled`}
                    label={'Enabled'}
                />
            </Form.Field>

            <Form.Field disabled={props.shouldBeDisabled()}>
                <label>Output Folder</label>
                <BrowseBar
                    path={`${props.path}.outputDirectory`}
                    options={{
                        title: 'Output Folder',
                        properties: ['openDirectory'],
                    }}
                />
            </Form.Field>

            <Form.Field disabled={props.shouldBeDisabled()}>
                <label>Filename Format</label>
                <InputSaved
                    path={`${props.path}.filename`}
                    defaultValue={'%CCYY-%MM-%DD %hh-%mm-%ss'}
                />
                <AccordionStateful>
                    {createTable(
                        ['Key', 'Description', 'Default Value'],
                        Object.keys(FILENAME_FORMATS).reduce((formats, category) => {
                            return formats.concat(FILENAME_FORMATS[category].map((entry) => {
                                let defValue = '';
                                if (entry.defaultValue !== undefined) {
                                    if (typeof entry.defaultValue === 'string')
                                        defValue = `"${entry.defaultValue}"`;
                                    else
                                        defValue = entry.defaultValue;
                                }
                                return [
                                    `$\{${entry.key}}`,
                                    entry.description,
                                    defValue
                                ];
                            }));
                        }, [])
                    )}
                </AccordionStateful>
            </Form.Field>

            <Form.Field disabled={props.shouldBeDisabled()}>
                <label>Data to copy (separate by semicolon ';')</label>
                <BrowseBar
                    path={`${props.path}.recordedData`}
                    options={{
                        title: 'File and folders to save',
                        defaultPath: executable.length > 0 ? path.parse(executable).dir : FileSystem.desktop(),
                        properties: [
                            'openDirectory',
                            'multiSelections',
                        ],
                    }}
                    parsePaths={(paths, isRelative, setValue) => setValue(paths.join(';'))}

                />
            </Form.Field>

        </div>
    );
};

SettingsModuleRecording.title = "Recording";
SettingsModuleRecording.path = "record";
SettingsModuleRecording.component = SettingsModuleRecording;

SettingsModuleRecording.defaultProps = {

};

SettingsModuleRecording.propTypes = {
    path: PropTypes.string.isRequired,
    shouldBeDisabled: PropTypes.func.isRequired,
};
