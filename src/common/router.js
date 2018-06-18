import { createElement } from 'react';
import dynamic from 'dva/dynamic';
import pathToRegexp from 'path-to-regexp';
import { getMenuData } from './menu';

let routerDataCache;

const modelNotExisted = (app, model) => (
  // eslint-disable-next-line
  !app._models.some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  })
);

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => {
  // () => require('module')
  // transformed by babel-plugin-dynamic-import-node-sync
  if (component.toString().indexOf('.then(') < 0) {
    models.forEach((model) => {
      if (modelNotExisted(app, model)) {
        // eslint-disable-next-line
        app.model(require(`../models/${model}`).default);
      }
    });
    return (props) => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return createElement(component().default, {
        ...props,
        routerData: routerDataCache,
      });
    };
  }
  // () => import('module')
  return dynamic({
    app,
    models: () => models.filter(
      model => modelNotExisted(app, model)).map(m => import(`../models/${m}.js`),
    ),
    // add routerData prop
    component: () => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return component().then((raw) => {
        const Component = raw.default || raw;
        return props => createElement(Component, {
          ...props,
          routerData: routerDataCache,
        });
      });
    },
  });
};

function getFlatMenuData(menus) {
  let keys = {};
  menus.forEach((item) => {
    if (item.children) {
      keys[item.path] = { ...item };
      keys = { ...keys, ...getFlatMenuData(item.children) };
    } else {
      keys[item.path] = { ...item };
    }
  });
  return keys;
}

export const getRouterData = (app) => {
  const routerConfig = {
    '/': {
      component: dynamicWrapper(app, ['user', 'login'], () => import('../layouts/BasicLayout')),
    },
    '/my-list/new': {
      component: dynamicWrapper(app, ['new'], () => import('../routes/MyList/New')),
    },
    '/my-list/start': {
      component: dynamicWrapper(app, ['myList'], () => import('../routes/MyList/Start')),
    },
    '/my-list/start/:id': {
      name: '申请单信息',
      component: dynamicWrapper(app, ['detail'], () => import('../routes/Detail/')),
    },
    '/my-list/process': {
      name: '正在审批',
      component: dynamicWrapper(app, ['myList'], () => import('../routes/MyList/Process')),
    },
    '/my-list/process/:id': {
      name: '申请单信息',
      component: dynamicWrapper(app, ['detail'], () => import('../routes/Detail/')),
    },
    '/my-list/end': {
      name: '审批完成',
      component: dynamicWrapper(app, ['myList'], () => import('../routes/MyList/End')),
    },
    '/my-list/end/:id': {
      name: '申请单信息',
      component: dynamicWrapper(app, ['detail'], () => import('../routes/Detail/')),
    },

    // 主管审批
    '/supervisor/start': {
      component: dynamicWrapper(app, ['supervisor'], () => import('../routes/Supervisor/Start')),
    },
    '/supervisor/start/:id': {
      name: '申请单信息',
      component: dynamicWrapper(app, ['detail'], () => import('../routes/Detail/')),
    },
    '/supervisor/end': {
      component: dynamicWrapper(app, ['supervisor'], () => import('../routes/Supervisor/End')),
    },
    '/supervisor/end/:id': {
      name: '申请单信息',
      component: dynamicWrapper(app, ['detail'], () => import('../routes/Detail/')),
    },

    // 出纳审批
    '/cashier/start': {
      component: dynamicWrapper(app, ['cashier'], () => import('../routes/Cashier/Start')),
    },
    '/cashier/start/:id': {
      name: '申请单信息',
      component: dynamicWrapper(app, ['detail'], () => import('../routes/Detail/')),
    },
    '/cashier/end': {
      component: dynamicWrapper(app, ['cashier'], () => import('../routes/Cashier/End')),
    },
    '/cashier/end/:id': {
      name: '申请单信息',
      component: dynamicWrapper(app, ['detail'], () => import('../routes/Detail/')),
    },

    // 集团往来审批
    '/inter-company/start': {
      component: dynamicWrapper(app, ['interCompany'], () => import('../routes/InterCompany/Start')),
    },
    '/inter-company/start/:id': {
      name: '申请单信息',
      component: dynamicWrapper(app, ['detail'], () => import('../routes/Detail/')),
    },
    '/inter-company/end': {
      component: dynamicWrapper(app, ['interCompany'], () => import('../routes/InterCompany/End')),
    },
    '/inter-company/end/:id': {
      name: '申请单信息',
      component: dynamicWrapper(app, ['detail'], () => import('../routes/Detail/')),
    },

    // 财务审核
    '/finance/start': {
      component: dynamicWrapper(app, ['finance'], () => import('../routes/Finance/Start')),
    },
    '/finance/start/:id': {
      name: '申请单信息',
      component: dynamicWrapper(app, ['detail'], () => import('../routes/Detail/')),
    },
    '/finance/end': {
      component: dynamicWrapper(app, ['finance'], () => import('../routes/Finance/End')),
    },
    '/finance/end/:id': {
      name: '申请单信息',
      component: dynamicWrapper(app, ['detail'], () => import('../routes/Detail/')),
    },

    // 财务审批
    '/chief/start': {
      component: dynamicWrapper(app, ['chief'], () => import('../routes/Chief/Start')),
    },
    '/chief/start/:id': {
      name: '申请单信息',
      component: dynamicWrapper(app, ['detail'], () => import('../routes/Detail/')),
    },
    '/chief/end': {
      component: dynamicWrapper(app, ['chief'], () => import('../routes/Chief/End')),
    },
    '/chief/end/:id': {
      name: '申请单信息',
      component: dynamicWrapper(app, ['detail'], () => import('../routes/Detail/')),
    },
    // 凭证号
    '/voucher/start': {
      component: dynamicWrapper(app, ['voucher'], () => import('../routes/Voucher/Start')),
    },
    // 凭证号
    '/voucher/new': {
      component: dynamicWrapper(app, ['voucher'], () => import('../routes/Voucher/New')),
    },
    '/voucher/start/:id': {
      name: '凭证信息',
      component: dynamicWrapper(app, ['voucher'], () => import('../routes/Voucher/Detail')),
    },
    '/voucher/end': {
      component: dynamicWrapper(app, ['voucher'], () => import('../routes/Voucher/End')),
    },
    '/voucher/end/:id': {
      name: '申请单信息',
      component: dynamicWrapper(app, ['voucher'], () => import('../routes/Detail/')),
    },

    // 出纳付款
    '/paying/start': {
      component: dynamicWrapper(app, ['paying'], () => import('../routes/Paying/Start')),
    },
    '/paying/start/:id': {
      name: '申请单信息',
      component: dynamicWrapper(app, ['detail'], () => import('../routes/Detail/')),
    },
    '/paying/end': {
      component: dynamicWrapper(app, ['paying'], () => import('../routes/Paying/End')),
    },
    '/paying/end/:id': {
      name: '申请单信息',
      component: dynamicWrapper(app, ['detail'], () => import('../routes/Detail/')),
    },

    // 出纳收款
    '/receipt/start': {
      component: dynamicWrapper(app, ['receipt'], () => import('../routes/Receipt/Start')),
    },
    '/receipt/new': {
      name: '创建收款',
      component: dynamicWrapper(app, ['receipt'], () => import('../routes/Receipt/New')),
    },
    '/receipt/start/:id': {
      name: '收款详情',
      component: dynamicWrapper(app, ['receipt'], () => import('../routes/Receipt/Detail')),
    },
    '/analysis/employee': {
      name: '员工报销统计',
      component: dynamicWrapper(app, [], () => import('../routes/Analysis/Employee')),
    },
    '/analysis/bank': {
      component: dynamicWrapper(app, [], () => import('../routes/Analysis/Bank')),
    },
    '/bank-statement/start': {
      component: dynamicWrapper(app, ['bankStatement'], () => import('../routes/BankStatement/List')),
    },
    '/bank-statement/new': {
      name: '创建银行流水',
      component: dynamicWrapper(app, ['bankStatement'], () => import('../routes/BankStatement/New')),
    },
    '/bank-statement/start/:id': {
      name: '银行流水详情',
      component: dynamicWrapper(app, ['bankStatement'], () => import('../routes/BankStatement/Detail')),
    },

    // 报表分析
    '/permission': {
      component: dynamicWrapper(app, ['permission'], () => import('../routes/Permission/List')),
    },

    // 系统设置- 付款公司
    '/setting/company': {
      component: dynamicWrapper(app, ['setting'], () => import('../routes/Setting/Company')),
    },
    // 系统设置- 收款方
    '/setting/vendor': {
      component: dynamicWrapper(app, ['setting'], () => import('../routes/Setting/Vendor')),
    },
    // 系统设置- 科目管理
    '/setting/account': {
      component: dynamicWrapper(app, ['setting'], () => import('../routes/Setting/Account')),
    },
    // 系统设置- 预设费用
    '/setting/default': {
      component: dynamicWrapper(app, ['setting'], () => import('../routes/Setting/Default')),
    },
    // 系统设置- 付款类型
    '/setting/type': {
      component: dynamicWrapper(app, ['setting'], () => import('../routes/Setting/Type')),
    },

    '/exception/403': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/403')),
    },
    '/exception/404': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/404')),
    },
    '/exception/500': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/500')),
    },
    '/user': {
      component: dynamicWrapper(app, [], () => import('../layouts/UserLayout')),
    },
    '/user/login': {
      component: dynamicWrapper(app, ['login'], () => import('../routes/User/Login')),
    },
    // '/user/:id': {
    //   component: dynamicWrapper(app, [], () => import('../routes/User/SomeComponent')),
    // },
  };
  // Get name from ./menu.js or just set it in the router data.
  const menuData = getFlatMenuData(getMenuData());

  // Route configuration data
  // eg. {name,authority ...routerConfig }
  const routerData = {};
  // The route matches the menu
  Object.keys(routerConfig).forEach((path) => {
    // Regular match item name
    // eg.  router /user/:id === /user/chen
    const pathRegexp = pathToRegexp(path);
    const menuKey = Object.keys(menuData).find(key => pathRegexp.test(`${key}`));
    let menuItem = {};
    // If menuKey is not empty
    if (menuKey) {
      menuItem = menuData[menuKey];
    }
    let router = routerConfig[path];
    // If you need to configure complex parameter routing,
    // https://github.com/ant-design/ant-design-pro-site/blob/master/docs/router-and-nav.md#%E5%B8%A6%E5%8F%82%E6%95%B0%E7%9A%84%E8%B7%AF%E7%94%B1%E8%8F%9C%E5%8D%95
    // eg . /list/:type/user/info/:id
    router = {
      ...router,
      name: router.name || menuItem.name,
      authority: router.authority || menuItem.authority,
    };
    routerData[path] = router;
  });
  return routerData;
};
