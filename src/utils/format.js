import numeral from 'numeral';
import moment from 'moment/moment';

// 用户格式化输出数据
export default {
  money: (m = 0) => numeral(parseFloat(m)).format('0,0.00'),
  percent: (value, formatString) => {
    if (formatString === undefined) {
      if (value === parseInt(value)) {
        formatString = '0%';
      } else {
        formatString = '0.00%';
      }
    }
    return numeral(value).format(formatString);
  },
  date: (date = null, reg = 'YYYY-MM-DD') => {
    if (typeof date === 'string') {
      return moment(date).format(reg);
    } else if (moment.isMoment(date)) {
      return date.format(reg);
    } else {
      return '';
    }
  },
  number: n => numeral(n).format('0.00'),

  // 货币格式化
  numberWithCommas: x => {
    if (isNaN(x)) {
      return '';
    }
    let parts = x.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  },
  // eslint-disable-next-line
  floor: (num, fractionDigits = 2) => (Math.floor(num * Math.pow(10, fractionDigits)) / Math.pow(10, fractionDigits)),
};
