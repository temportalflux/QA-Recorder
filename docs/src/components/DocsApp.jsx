import React from 'react';
import {Page} from "./pages/Page";
import {Container, Dimmer, Header, Icon, Loader} from "semantic-ui-react";
import * as lodash from 'lodash';
import reportMain from '../reportMain.json';
import reportDocs from '../reportDocs.json';
import path from 'path';
import {Router} from "./Router";

/**
 * TODO: Document
 */
export default class DocsApp extends React.Component {

    constructor(props) {
        super(props);

        this.parseReport = this.parseReport.bind(this);
        this.buildComponentMenu = this.buildComponentMenu.bind(this);

        this.state = {
            hasLoaded: false,
            project: {
                projectInfo: {
                    title: 'Unknown',
                    subtitle: '',
                    version: '0.0.0',
                },
                menu: {
                    title: '',
                    entries: [],
                },
                componentMenu: [],
            },
            routeData: {
                main: {
                    render: () => <div/>,
                },
                error: {
                    render: () => <div/>,
                },
                menu: [],
                components: [],
            },
        };

    }

    /**
     * TODO: Document
     * @param obj
     */
    parseReport(obj) {
        let componentCategories = {};
        lodash.forIn(obj, (compInfo, componentFullPath) => {
            let compPathMatch = new RegExp('.*src.*components.(.*)', 'g').exec(componentFullPath);
            let componentPath = path.basename(compPathMatch[1], path.extname(compPathMatch[1])).split('\\');
            lodash.set(componentCategories, componentPath, compInfo);
        });
        return componentCategories;
    }

    /**
     * TODO: Document
     * @param component
     * @param pathKeys
     * @param routes
     * @returns {*}
     */
    buildComponentMenu(component, pathKeys, routes) {
        if (component.hasOwnProperty('displayName')) {
            let routePath = `/${pathKeys.join('/')}`;
            routes.push({
                examplesPath: routePath,
                render: () => <Page.Component info={component}/>,
            });
            return {
                route: routePath,
                displayName: component.displayName,
            };
        }
        else {
            return {
                categoryName: lodash.last(pathKeys),
                components: Object.keys(component).map((compKey) => {
                    let compValue = component[compKey];
                    return this.buildComponentMenu(compValue, [...pathKeys, compKey], routes);
                })
            };
        }
    }

    componentDidMount() {
        let updates = {
            hasLoaded: true,
            project: {
                projectInfo: {
                    title: 'QA Recorder',
                    subtitle: 'The is the package short description',
                    version: '1.0.1',
                },
                menu: {
                    title: 'Getting Started',
                    entries: [
                        {
                            type: 'route',
                            route: '/',
                            title: 'Introduction',
                        },
                        {
                            type: 'link',
                            url: '',
                            content: <label><Icon name='github' /> GitHub</label>
                        },
                        {
                            type: 'link',
                            url: '',
                            content: <label><Icon name='file outline' /> CHANGELOG</label>
                        },
                    ],
                },
                componentMenu: [],
            },
            routeData: {
                main: {
                    render: () => {
                        let projectInfo = this.state.project.projectInfo;
                        return (
                            <Page projectInfo={projectInfo} markdown={'# Introduction'}/>
                        );
                    },
                },
                error: {
                    render: () => <Container>Error: 404. Not Found.</Container>,
                },
                menu: [
                ],
                components: [],
            },
        };

        updates.project.componentMenu = [
            this.buildComponentMenu(this.parseReport(reportDocs), ["components", "Docs"], updates.routeData.components),
            this.buildComponentMenu(this.parseReport(reportMain), ["components", "Main"], updates.routeData.components),
        ];

        this.setState(updates);
    }

    render() {
        if (this.state.hasLoaded) {
            return (
                <Router
                    project={this.state.project}
                    routeMain={this.state.routeData.main}
                    routeError={this.state.routeData.error}
                    routes={lodash.flatten(lodash.values(lodash.pick(this.state.routeData, ['menu', 'components'])))}
                />
            );
        }
        else {
            return (
                <Dimmer active inverted>
                    <Loader inverted>
                        Loading Documentation
                        <Header.Subheader>Please be patient</Header.Subheader>
                    </Loader>
                </Dimmer>
            );
        }
    }

}

DocsApp.defaultProps = {};

DocsApp.propTypes = {};
