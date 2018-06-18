import RenderAuthorized from '../components/Authorized';
import { getAuthority } from './authority';

let Authorized = RenderAuthorized(getAuthority()); // eslint-disable-line

// Reload the rights component
const reloadAuthorized = (value = getAuthority()) => {
  Authorized = RenderAuthorized(value);
};

export { reloadAuthorized };
export default Authorized;
