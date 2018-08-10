import React from 'react';
import * as lodash from "lodash";
import {Header, List} from "semantic-ui-react";
import {Link} from 'react-static';

const linkListStyle = {
    background: '#f7f7f7',
    boxShadow: '0 0 1em 0.5em #f7f7f7',
    margin: '0.5em',
    padding: '0.5em',
    position: 'absolute',
    right: '0',
    top: '0',
};

export const PageComponentHeader = (props) => {
    return (
        <div>
            <Header
                as='h1'
                content={props.displayName}
                subheader={lodash.join(props.description, ' ')}
            />
            <List horizontal link size='small' style={{ display: 'block' }}>
                {/* Heads up! Still render empty lists to reserve the whitespace */}
                <List.Item>
                    <Header color='grey' content={props.seeTags.length > 0 ? 'See:' : ' '} size='tiny' />
                </List.Item>
                {lodash.map(props.seeTags, ({ displayName, to }) => (
                    <List.Item as={Link} content={displayName} key={displayName} to={to} />
                ))}
            </List>
            <List link style={linkListStyle}>
                <List.Item
                    content={
                        <code>
                            <a href={`${props.repoURL}/blob/master/${props.repoPath}`} target='_blank' rel='noopener noreferrer'>
                                {props.repoPath}
                            </a>
                        </code>
                    }
                    icon='github'
                />
            </List>
        </div>
    );
};

PageComponentHeader.defaultProps = {};

PageComponentHeader.propTypes = {};
