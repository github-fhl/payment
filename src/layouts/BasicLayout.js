import React from 'react';
import PropTypes from 'prop-types';
import { Layout, message } from 'antd';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import { Route, Redirect, Switch, routerRedux, Link } from 'dva/router';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import { enquireScreen } from 'enquire-js';
import pathToRegexp from 'path-to-regexp';
import Exception from 'components/Exception';
import { config } from 'utils';
import GlobalHeader from '../components/GlobalHeader';
import SiderMenu from '../components/SiderMenu';
import NotFound from '../routes/Exception/404';
import { getRoutes } from '../utils/utils';
import Authorized from '../utils/Authorized';
import { getMenuData } from '../common/menu';

const { Content, Header } = Layout;
const { AuthorizedRoute } = Authorized;

/**
 * 根据菜单取得重定向地址.
 */
const redirectData = [];
const getRedirect = (item) => {
  if (item && item.children) {
    if (item.children[0] && item.children[0].path) {
      redirectData.push({
        from: `${item.path}`,
        to: `${item.children[0].path}`,
      });
      item.children.forEach((children) => {
        getRedirect(children);
      });
    }
  }
};
getMenuData().forEach(getRedirect);

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
  },
};

let isMobile;
enquireScreen((b) => {
  isMobile = b;
});


@connect(({ user, global }) => ({
  currentUser: user.userinfo,
  role: user.role,
  logNum: user.logNum,
  collapsed: global.collapsed,
  locale: global.locale,
}))
export default class BasicLayout extends React.PureComponent {
  static childContextTypes = {
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
  };
  state = {
    isMobile,
  };

  getChildContext() {
    const { location, routerData } = this.props;
    return {
      location,
      breadcrumbNameMap: routerData,
    };
  }

  componentDidMount() {
    enquireScreen((mobile) => {
      this.setState({
        isMobile: mobile,
      });
    });
    this.props.dispatch({ type: 'setting/fetchAll' });
  }

  onChangeLanguage = () => {
    const payload = this.props.locale === 'en' ? 'zh' : 'en';
    this.props.dispatch({ type: 'global/changeLanguage', payload });
  };

  getTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    if (routerData[pathname]) {
      return routerData[pathname].name;
    } else {
      const hasParamsPaths = Object.keys(routerData).filter(path => path.includes('/:'));
      const pathKey = hasParamsPaths.find(path => pathToRegexp(path).test(`${pathname}`));
      return routerData[pathKey] && routerData[pathKey].name;
    }
  }

  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    let title = 'Payment';
    if (routerData[pathname] && routerData[pathname].name) {
      title = `${routerData[pathname].name} - Payment`;
    }
    return title;
  }

  getBashRedirect = () => {
    // According to the url parameter to redirect
    // 这里是重定向的,重定向到 url 的 redirect 参数所示地址
    const urlParams = new URL(window.location.href);

    let redirect = urlParams.searchParams.get('redirect');
    // Remove the parameters in the url
    if (redirect) {
      urlParams.searchParams.delete('redirect');
      window.history.replaceState(null, 'redirect', urlParams.href);
    } else {
      // Authorized.check()
      // const menuData = getMenuData();
      // const firstAuthorityMenu = menuData.find(item => Authorized.check(item.authority, true, false));
      // if (firstAuthorityMenu) {
      //   return firstAuthorityMenu.path;
      // }
      const hasRoleRootFiles = this.props.role.find(key => config.rolesRoot[key]);
      if (hasRoleRootFiles) return config.rolesRoot[hasRoleRootFiles];
      return '/my-list';
    }
    return redirect;
  };
  handleMenuCollapse = (collapsed, type) => {
    if (!type) {
      this.props.dispatch({
        type: 'global/changeLayoutCollapsed',
        payload: collapsed,
      });
    }
  };
  handleNoticeClear = (type) => {
    message.success(`清空了${type}`);
    this.props.dispatch({
      type: 'global/clearNotices',
      payload: type,
    });
  };
  handleMenuClick = ({ key }) => {
    if (key === 'triggerError') {
      this.props.dispatch(routerRedux.push('/exception/trigger'));
      return;
    }
    if (key === 'logout') {
      this.props.dispatch({
        type: 'login/logout',
      });
    }
  };
  handleNoticeVisibleChange = (visible) => {
    if (visible) {
      this.props.dispatch({
        type: 'global/fetchNotices',
      });
    }
  };

  render() {
    const {
      currentUser, collapsed, fetchingNotices, notices, routerData, match, location, logNum,
    } = this.props;

    const bashRedirect = this.getBashRedirect();
    const menuData = getMenuData();
    const layout = (
      <Layout>
        <SiderMenu
          // logo={logo}
          // 不带Authorized参数的情况下如果没有权限,会强制跳到403界面
          // If you do not have the Authorized parameter
          // you will be forced to jump to the 403 interface without permission
          Authorized={Authorized}
          menuData={menuData}
          collapsed={collapsed}
          location={location}
          isMobile={this.state.isMobile}
          logNum={logNum}
          onCollapse={this.handleMenuCollapse}
        />
        <Layout>
          <Header style={{ padding: 0 }}>
            <GlobalHeader
              title={this.getTitle()}
              // logo={logo}
              currentUser={currentUser}
              fetchingNotices={fetchingNotices}
              notices={notices}
              collapsed={collapsed}
              isMobile={this.state.isMobile}
              onNoticeClear={this.handleNoticeClear}
              onCollapse={this.handleMenuCollapse}
              onMenuClick={this.handleMenuClick}
              onNoticeVisibleChange={this.handleNoticeVisibleChange}
            />
          </Header>
          <Content style={{ margin: '24px 24px 0', height: '100%' }}>
            <Switch>
              {
                redirectData.map(item =>
                  <Redirect key={item.from} exact from={item.from} to={item.to} />,
                )
              }
              {
                getRoutes(match.path, routerData).map(item =>
                  (
                    <AuthorizedRoute
                      key={item.key}
                      path={item.path}
                      component={item.component}
                      exact
                      authority={item.authority}
                      noMatch={<Exception type="403" linkElement={Link} />}
                    />
                  ),
                )
              }
              {
                Object.keys(routerData).filter(key => key.includes('/:id')).map(key => {
                  const item = routerData[key];
                  let authority = item.authority;

                  // 如果detail 没有设置权限，则默认使用menu 设置的根目录权限
                  if (!authority) {
                    const menuItem = menuData.find(subItem => key.startsWith(subItem.path));
                    if (menuItem && menuItem.authority) {
                      authority = menuItem.authority;
                    }
                  }
                  return (
                    <AuthorizedRoute
                      key={key}
                      path={key}
                      component={item.component}
                      authority={authority}
                      noMatch={<Exception type="403" linkElement={Link} />}
                    />
                  );
                })
              }
              <Redirect exact from="/" to={bashRedirect} />
              <Redirect exact from="/my-list" to="/my-list/start" />
              <Redirect exact from="/bank-statement" to="/bank-statement/start" />
              <Route render={NotFound} />
            </Switch>
          </Content>
        </Layout>
      </Layout>
    );

    return (
      <DocumentTitle title={this.getPageTitle()}>
        <ContainerQuery query={query}>
          {params => <div className={classNames(params)}>{layout}</div>}
        </ContainerQuery>
      </DocumentTitle>
    );
  }
}
