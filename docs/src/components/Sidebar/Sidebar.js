import keyboardKey from 'keyboard-key'
import PropTypes from 'prop-types'
import React from 'react'
import {Icon, Input, Menu, Ref} from 'semantic-ui-react'
import * as shortid from "shortid";
import {Link} from "react-static";
import * as lodash from 'lodash';

export default class Sidebar extends React.Component {

    constructor(props) {
        super(props);

        this.handleSearchRef = this.handleSearchRef.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handleSearchKeyDown = this.handleSearchKeyDown.bind(this);
        this.handleItemClick = this.handleItemClick.bind(this);
        this.renderSearchItems = this.renderSearchItems.bind(this);
        this.renderItems = this.renderItems.bind(this);

        this.state = {
            selectedItemIndex: -1,
            query: '',
        };
        this.history = [];
    }

    handleSearchRef(c) {
        this._searchInput = c && c.querySelector('input')
    };

    handleSearchChange(e) {
        // ignore first "/" on search focus
        if (e.target.value === '/') return;

        this.setState({
            selectedItemIndex: 0,
            query: e.target.value,
        });
    }

    handleSearchKeyDown(e) {
        const { selectedItemIndex } = this.state;
        const code = keyboardKey.getCode(e);

        if (code === keyboardKey.Enter && this.selectedRoute) {
            e.preventDefault();
            this.history.push(this.selectedRoute);
            this.selectedRoute = null;
            this.setState({ query: '' })
        }

        if (code === keyboardKey.ArrowDown) {
            e.preventDefault();
            const next = lodash.min([selectedItemIndex + 1, this.filteredMenu.length - 1]);
            this.selectedRoute = this.filteredMenu[next].route;
            this.setState({ selectedItemIndex: next });
        }

        if (code === keyboardKey.ArrowUp) {
            e.preventDefault();
            const next = lodash.max([selectedItemIndex - 1, 0]);
            this.selectedRoute = this.filteredMenu[next].route;
            this.setState({ selectedItemIndex: next });
        }
    }

    handleItemClick() {
        const { query } = this.state;
        if (query) this.setState({ query: '' });
        if (document.activeElement === this._searchInput) this._searchInput.blur();
    }

    render() {
        const { style } = this.props;
        return (
            <div style={style}>
                <Menu
                    fluid
                    inverted
                    vertical
                    borderless
                    compact
                    style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
                >
                    <Menu.Item>
                        {this.props.header}
                    </Menu.Item>
                    <Menu.Item style={{ boxShadow: '0 0 1rem black' }}>
                        <Menu.Header>{this.props.menu.title}</Menu.Header>
                        <Menu.Menu>
                            {this.props.menu.entries.map((entry) => {
                                switch (entry.type) {
                                    case 'route':
                                        return (
                                            <Menu.Item
                                                key={shortid.generate()}
                                                as={Link}
                                                exact
                                                to={entry.route}
                                                activeClassName='active'
                                            >
                                                {entry.title}
                                            </Menu.Item>
                                        );
                                    case 'link':
                                        return (
                                            <Menu.Item
                                                key={shortid.generate()}
                                                as='a'
                                                href={entry.url}
                                                target='_blank'
                                                rel='noopener noreferrer'>
                                                {entry.content}
                                            </Menu.Item>
                                        );
                                    default:
                                        return <div />;
                                }
                            })}
                        </Menu.Menu>
                    </Menu.Item>
                    <div style={{ flex: 1, marginTop: '1rem', overflowY: 'scroll' }}>
                        <Menu.Item>
                            <Ref innerRef={this.handleSearchRef}>
                                <Input
                                    fluid
                                    icon={{ name: 'filter', color: 'teal', inverted: true, bordered: true }}
                                    placeholder='Press &quot;/&quot; to filter'
                                    value={this.state.query}
                                    onChange={this.handleSearchChange}
                                    onKeyDown={this.handleSearchKeyDown}
                                />
                            </Ref>
                        </Menu.Item>
                        {this.state.query ? this.renderSearchItems() : this.renderItems(this.props.componentMenu)}
                    </div>
                </Menu>
            </div>
        )
    }

    renderItems(menuItem) {
        if (menuItem.hasOwnProperty('displayName')) {
            return (
                <Menu.Item
                    key={menuItem.displayName}
                    name={menuItem.displayName}
                    as={Link}
                    onClick={this.handleItemClick}
                    to={menuItem.route}
                    activeClassName='active'
                />
            );
        }
        else if (Array.isArray(menuItem))
        {
            return menuItem.map((info) => {
                return this.renderItems(info);
            });
        }
        else {
            return (
                <Menu.Item key={shortid.generate()}>
                    <Menu.Header>{lodash.capitalize(menuItem.categoryName)}</Menu.Header>
                    <Menu.Menu>
                        {this.renderItems(menuItem.components)}
                    </Menu.Menu>
                </Menu.Item>
            );
        }
    }

    renderSearchItems() {
        const { selectedItemIndex, query } = this.state;
        if (!query) return;

        let itemIndex = -1;
        const startsWithMatches = [];
        const containsMatches = [];
        const escapedQuery = lodash.escapeRegExp(query);

        lodash.forEach(lodash.flatten(lodash.values(this.props.componentMenu)), (info) => {
            if (new RegExp(`^${escapedQuery}`, 'i').test(info.displayName)) {
                startsWithMatches.push(info)
            } else if (new RegExp(escapedQuery, 'i').test(info.displayName)) {
                containsMatches.push(info)
            }
        });

        this.filteredMenu = [...startsWithMatches, ...containsMatches];
        const hasMultipleMatches = this.filteredMenu.length > 1;
        const menuItems = this.filteredMenu.map((info) => {
            itemIndex += 1;
            const isSelected = itemIndex === selectedItemIndex;
            if (isSelected) this.selectedRoute = info.route;
            return (
                <Menu.Item
                    key={info.displayName}
                    name={info.displayName}
                    onClick={this.handleItemClick}
                    active={isSelected}
                    as={Link}
                    to={info.route}
                >
                    {info.displayName}
                    {isSelected && <SelectedItemLabel showArrows={hasMultipleMatches} />}
                </Menu.Item>
            );
        });

        return <Menu.Menu>{menuItems}</Menu.Menu>;
    }

}

Sidebar.defaultProps = {
    menu: {
        title: '',
        entries: [],
    },
    componentMenu: {},
};

Sidebar.propTypes = {
    menu: PropTypes.object.isRequired,
    componentMenu: PropTypes.array.isRequired,
};

const selectedItemLabelStyle = {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    padding: '4px 0.5rem',
    margin: '2px',
    color: '#8ff',
    background: '#222',
};
const SelectedItemLabel = ({ showArrows }) => (
    <span style={selectedItemLabelStyle}>
    {showArrows && <Icon name='exchange' rotated='clockwise' />}
        {showArrows && 'or '}
        Enter
  </span>
);
SelectedItemLabel.propTypes = {
    showArrows: PropTypes.bool,
};
