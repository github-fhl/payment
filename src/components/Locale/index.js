import React from 'react';
import { connect } from 'dva';
import { LocaleProvider } from 'antd';
import zhCn from 'antd/lib/locale-provider/zh_CN';

const I18nWithAntd = props => {
  return (
    <LocaleProvider locale={zhCn}>
      {props.children}
    </LocaleProvider>
  );
};
export default connect()(I18nWithAntd);
