import React from 'react';
import { routerRedux, Route, Switch } from 'dva/router';
import { Spin } from 'antd';
import dynamic from 'dva/dynamic';
import Locale from './components/Locale';
import { getRouterData } from './common/router';
import Authorized from './utils/Authorized';
import styles from './index.less';

const { ConnectedRouter } = routerRedux;
const { AuthorizedRoute } = Authorized;
dynamic.setDefaultLoadingComponent(() => {
  return <Spin size="large" className={styles.globalSpin} />;
});

function RouterConfig({ history, app }) {
  const routerData = getRouterData(app);
  const UserLayout = routerData['/user'].component;
  const BasicLayout = routerData['/'].component;
  return (
    <Locale>
      <ConnectedRouter history={history}>
        <Switch>
          <Route
            path="/user"
            component={UserLayout}
          />
          <AuthorizedRoute
            path="/"
            render={BasicLayout}
          />
        </Switch>
      </ConnectedRouter>
    </Locale>
  );
}

export default RouterConfig;
