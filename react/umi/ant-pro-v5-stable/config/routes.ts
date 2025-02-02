export default [
  {
    path: '/user',
    layout: false,
    routes: [
      { path: '/user', routes: [{ name: '登录', path: '/user/login', component: './user/Login' }] },
    ],
  },
  { path: '/welcome', name: '欢迎', icon: 'smile', component: './Welcome' },
  {
    path: '/admin',
    name: '管理页',
    icon: 'crown',
    access: 'canAdmin',
    component: './Admin',
    routes: [
      { path: '/admin/sub-page', name: '二级管理页', icon: 'smile', component: './Welcome' },
    ],
  },
  { name: '查询表格', icon: 'table', path: '/list', component: './TableList' },

  { name: 'table+checkbox', icon: 'table', path: '/table&checkbox', component: './table&checkbox' },

  { name: 'form', icon: 'form', path: '/form-test', component: './form' },
  { name: 'ComponentFactory', icon: 'form', path: '/bi-sheng', component: './Bisheng' },
  { path: '/', redirect: '/welcome' },
  { component: './404' },
];
