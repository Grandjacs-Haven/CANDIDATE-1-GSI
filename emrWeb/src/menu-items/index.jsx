// project import
import operations from './operations';
import { getPathForRole } from 'utils/roles';
import { hasScope } from 'utils/scopes';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: operations
};

function applyRoleUrls(role, item) {
  return {
    ...item,
    ...(item.url && { url: getPathForRole(role, item.url) }),
    ...(item.children && { children: item.children.map((child) => applyRoleUrls(role, child)) })
  };
}

export function getMenuItemsForSession({ role, scopes } = {}) {
  const canShowItem = (item) => {
    if (item.hideInMenu) return false;
    if (!item.scopes) return true;

    return hasScope(scopes, item.scopes);
  };

  return {
    items: menuItems.items
      .filter(canShowItem)
      .map((item) => ({
        ...item,
        children: item.children?.filter(canShowItem)
      }))
      .map((item) => applyRoleUrls(role, item))
      .filter((item) => !item.children || item.children.length)
  };
}

export function getMenuItemsForRole(role) {
  return getMenuItemsForSession({ role, scopes: [] });
}

export default menuItems;
