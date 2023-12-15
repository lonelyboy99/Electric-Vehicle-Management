import { ViewModuleIcon, Edit1Icon, LayersIcon } from 'tdesign-icons-vue';
import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/list',
    name: 'list',
    component: Layout,
    redirect: '/list/base',
    meta: { title: '故障维护', icon: ViewModuleIcon },
    children: [
      {
        path: 'base',
        name: 'ListBase',
        component: () => import('@/pages/list/base/index.vue'),
        meta: { title: '灯具信息' },
      },
      {
        path: 'tree',
        name: 'ListTree',
        component: () => import('@/pages/list/tree/index.vue'),
        meta: { title: '操作配置' },
      },
    ],
  },
  {
    path: '/form',
    name: 'form',
    component: Layout,
    redirect: '/form/base',
    meta: { title: '工单系统', icon: Edit1Icon },
    children: [
      {
        path: 'base',
        name: 'FormBase',
        component: () => import('@/pages/form/base/index.vue'),
        meta: { title: '工单录入' },
      },
    ],
  },
  {
    path: '/detail',
    name: 'detail',
    component: Layout,
    redirect: '/detail/base',
    meta: { title: '客户管理', icon: LayersIcon },
    children: [
      {
        path: 'base',
        name: 'DetailBase',
        component: () => import('@/pages/detail/base/index.vue'),
        meta: { title: '基础详情页' },
      },
    ],
  },
];
