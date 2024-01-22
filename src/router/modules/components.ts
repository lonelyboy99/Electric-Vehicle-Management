import {
  ViewModuleIcon,
  Edit1Icon,
  UsergroupIcon,
  LinkUnlinkIcon,
  LayersIcon,
} from "tdesign-icons-vue"
import Layout from "@/layouts/index.vue"

export default [
  {
    path: "/custom",
    name: "custom",
    component: Layout,
    redirect: "/custom/base",
    meta: { title: "客户管理", icon: UsergroupIcon },
    children: [
      {
        path: "",
        name: "CustomDeploy",
        component: () => import("@/pages/custom/deploy/index.vue"),
      },
    ],
  },
  {
    path: "/system",
    name: "system",
    component: Layout,
    redirect: "/system/base",
    meta: { title: "系统配置", icon: ViewModuleIcon },
    children: [
      {
        path: "base",
        name: "SystemBase",
        component: () => import("@/pages/system/base/index.vue"),
        meta: { title: "灯具信息" },
      },
      {
        path: "tree",
        name: "SystemTree",
        component: () => import("@/pages/system/tree/index.vue"),
        meta: { title: "操作配置" },
      },
    ],
  },
  {
    path: "/fault",
    name: "fault",
    component: Layout,
    redirect: "/fault",
    meta: { title: "故障维护", icon: LinkUnlinkIcon },
    children: [
      {
        path: "", // 不设置子路径
        name: "FaultBase",
        component: () => import("@/pages/fault/index.vue"),
      },
    ],
  },
  {
    path: "/work",
    name: "form",
    component: Layout,
    redirect: "/work/base",
    meta: { title: "工单系统", icon: Edit1Icon },
    children: [
      {
        path: "base",
        name: "FormBase",
        component: () => import("@/pages/work/base/index.vue"),
        meta: { title: "工单发布" },
      },
      {
        path: "filter",
        name: "ListFilter",
        component: () => import("@/pages/work/filter/index.vue"),
        meta: { title: "工单信息" },
      },
    ],
  },
  {
    path: "/count",
    name: "count",
    component: Layout,
    redirect: "/count",
    meta: { title: "统计分析", icon: LayersIcon },
    children: [
      {
        path: "", // 不设置子路径
        name: "CountBase",
        component: () => import("@/pages/count/index.vue"),
      },
    ],
  }
]
