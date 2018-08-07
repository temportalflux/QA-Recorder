import React from 'react';
import style from '../Style'
import {Page} from "./pages/Page";
import {PageRouter} from "./pages/PageRouter";
import {Icon} from "semantic-ui-react";
import {ProjectHeader} from "./Header/ProjectHeader";
import * as lodash from 'lodash';
import reportMain from '../reportMain.json';
import reportDocs from '../reportDocs.json';
import path from 'path';
import PageComponent from "./pages/PageComponent";

export default class DocsApp extends React.Component {

    constructor(props) {
        super(props);

        this.parseReport = this.parseReport.bind(this);

        this.state = {
            docs: undefined,
            componentRoutes: {},
        };
        this.state.docs = [
            this.buildComponentMenu(this.parseReport(reportDocs), ["components", "Main"], this.state.componentRoutes),
            this.buildComponentMenu(this.parseReport(reportMain), ["components", "Docs"], this.state.componentRoutes),
        ];

        console.log(this.state);

    }

    parseReport(obj) {
        let componentCategories = {};
        lodash.forIn(obj, (compInfo, componentFullPath) => {
            let compPathMatch = new RegExp('.*src.*components.(.*)', 'g').exec(componentFullPath);
            let componentPath = path.basename(compPathMatch[1], path.extname(compPathMatch[1])).split('\\');
            lodash.set(componentCategories, componentPath, compInfo);
        });
        return componentCategories;
    }

    buildComponentMenu(component, pathKeys, routes) {
        if (component.hasOwnProperty('displayName')) {
            routes[`/${pathKeys.join('/')}`] = () => {
                return <PageComponent info={component}/>;
            };
            return {
                route: `/${pathKeys.join('/')}`,
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

    render() {
        let sidebar = true;
        const mainStyle = sidebar ? style.sidebarMain : style.main;
        let projectInfo = {
            title: 'QA Recorder',
            subtitle: 'The is the package short description',
            version: '1.0.1',
        };
        let routes = [
            {
                route: '/',
                title: 'Introduction',
            },
        ].map((routeObj) => {
            return lodash.defaultsDeep(routeObj, {
                type: 'route',
                render: () => {
                    return (
                        <Page projectInfo={projectInfo} />
                    );
                },
            });
        });
        let otherMenuItems = [
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
        ];
        let menu = {
            title: 'Getting Started',
            entries: [
                ...routes,
                ...otherMenuItems,
            ],
        };
        return (
            <PageRouter
                style={{
                    container: style.container,
                    main: mainStyle,
                }}
                sidebar={{
                    style: style.menu,
                    header: (
                        <ProjectHeader title={projectInfo.title} subtitle={`v${projectInfo.version}`} inline />
                    ),
                    menu: menu,
                    componentMenu: this.state.docs,
                }}
                routes={
                    lodash.merge(
                        routes.reduce((obj, route) => {
                            obj[route.route] = route.render;
                            return obj;
                        }, {}),
                        this.state.componentRoutes
                    )
                }
            />
        );
    }

}

DocsApp.defaultProps = {};

DocsApp.propTypes = {};