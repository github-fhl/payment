import React, { Component } from 'react';
import { connect } from 'dva';
import { Card } from 'antd';
import DescriptionList from 'components/DescriptionList';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { format } from '../../utils';
import styles from './Profile.less';

const { Description } = DescriptionList;


@connect(({ company, loading }) => ({
  data: company.profile,
  loading: loading.effects['profile/fetchBasic'],
}))
export default class BasicProfile extends Component {
  componentDidMount() {
    this.props.dispatch({ type: 'company/fetchProfile' });
  }

  render() {
    const { data } = this.props;
    const description = (
      <div>
        <div className={styles.companyLogo}>
          {data.logo && <img src={data.logo} alt="" />}
        </div>
        <DescriptionList className={styles.headerList} size="small" col="2">
          <Description term="创建日期">
            {format.date(data.createdAt)}
          </Description>
          <Description term="更新日期">
            {format.date(data.updatedAt)}
          </Description>
        </DescriptionList>
      </div>
    );
    return (
      <PageHeaderLayout
        content={description}
      >
        <Card
          bordered={false}
          title="基本信息"
          style={{ marginBottom: 24 }}
        >
          <DescriptionList size="large">
            <Description term="公司名称">
              {data.name}
            </Description>
            <Description term="公司地址">
              {data.address}
            </Description>
            <Description term="公司性质">
              {data.companyType}
            </Description>
            <Description term="合同日期">
              {format.date(data.endDt)}
            </Description>
            <Description term="公司规模">
              {data.size}
            </Description>
          </DescriptionList>
        </Card>
        <Card
          bordered={false}
          title="相关限制"
          style={{ marginBottom: 24 }}
        >
          <DescriptionList size="large">
            <Description term="公司最大人数">
              {data.maxPersonCount}
            </Description>
          </DescriptionList>
        </Card>
      </PageHeaderLayout>
    );
  }
}
