import { DashboardIcon } from "tdesign-icons-vue"
import Layout from "@/layouts/index.vue"

export default [
  {
    path: "/home",
    component: Layout,
    redirect: "/home/base",
    name: "dashboard",
    meta: {
      title: "首页",
      icon: DashboardIcon,
    },
    children: [
      {
        path: "base",
        name: "DashboardBase",
        component: () => import("@/pages/home/base/index.vue"),
        meta: { title: "图表展示" },
      },
      {
        path: "detail",
        name: "DashboardDetail",
        component: () => import("@/pages/home/detail/index.vue"),
        meta: { title: "数据展示" },
      },
    ],
  },
]
