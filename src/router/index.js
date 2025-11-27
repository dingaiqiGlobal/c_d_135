/*
 * @Author: dys
 * @Date: 2023-08-03 15:41:53
 * @LastEditors: dys
 * @LastEditTime: 2025-11-27 14:39:35
 * @Descripttion:
 */
import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/AxisPlane",
    name: "AxisPlane",
    component: () => import("../components/AxisPlane/AxisPlane.vue"),
  },
  {
    path: "/DrawEdit",
    name: "DrawEdit",
    component: () => import("../components/DrawEdit/DrawEdit.vue"),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
