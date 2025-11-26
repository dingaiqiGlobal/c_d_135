<!--
 * @Author: dys
 * @Date: 2025-11-24 16:59:03
 * @LastEditors: dys
 * @LastEditTime: 2025-11-26 14:58:11
 * @Descripttion: 
-->
<template>
  <div>
    <div id="cesiumContainer"></div>
  </div>
</template>

<script>
import * as dat from "dat.gui";
import "cesium/Widgets/widgets.css";
import * as Cesium from "cesium/Cesium";
import EditCesium from "./js/EditCesium";
export default {
  components: {},

  data() {
    return {
      viewer: null,
      point: null,
      model: null,
      tileset: null,
    };
  },

  computed: {},

  mounted() {
    Cesium.Ion.defaultAccessToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0ZjI1YWYwNS00ODJiLTQzOTYtYTA3My0zMzI3ODFiZTdkYzAiLCJpZCI6MjAzOTgsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NzczNDAzMjN9.s1TyB5DYncqM_xAF-ekua_P4fcZmmyeVR4hA9ec9G4Q";
    this.viewer = new Cesium.Viewer("cesiumContainer", {
      // scene3DOnly:true,
      homeButton: false, // 是否显示home控件
      vrButton: false,
      fullscreenButton: true,
      animation: true, // 是否显示动画控件
      geocoder: false, // 是否显示地名查找控件
      timeline: true, // 是否显示时间线控件
      sceneModePicker: false, // 是否显示投影方式控件
      navigationHelpButton: false, // 是否显示帮助信息控件
      infoBox: false, // 是否显示点击要素之后显示的信息
      baseLayerPicker: false, // 是否显示图层选择控件
      selectionIndicator: true, // Disable selection indicator
      shouldAnimate: true,
      // requestRenderMode: true
    });
    this.viewer._cesiumWidget._creditContainer.style.display = "none";
    this.viewer.animation.container.style.visibility = "hidden"; // 不显示动画控件
    this.viewer.timeline.container.style.visibility = "hidden"; // 不显示时间控件

    // this.viewer.camera.flyTo({
    //   destination: Cesium.Cartesian3.fromDegrees(116.39801, 39.89869, 500),
    //   orientation: {
    //     heading: Cesium.Math.toRadians(0),
    //     pitch: Cesium.Math.toRadians(-90), // 俯仰角（低头看）
    //   },
    // });

    this.addPointEntity();
    this.addModel();
    this.add3dtiles();
  },

  methods: {
    addPointEntity() {
      this.point = this.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(116.39801, 39.89869, 5),
        point: {
          pixelSize: 10,
          color: Cesium.Color.RED,
        },
      });
      const pointEditCesium = new EditCesium(this.viewer, {
        translateEnabled: true,
      });
      pointEditCesium.addTo(this.point);
    },
    async addModel() {
      const origin = Cesium.Cartesian3.fromDegrees(116.39643, 39.89863, 50);
      const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
      this.model = await Cesium.Model.fromGltfAsync({
        url: "/data/gltf/Cesium_Air.glb",
        modelMatrix: modelMatrix,
        scale: 10,
      });
      this.viewer.scene.primitives.add(this.model);

      const modelEditCesium = new EditCesium(this.viewer, {
        rotateEnabled: true,
        translateEnabled: true,
        scaleEnabled: true,
      });
      modelEditCesium.addTo(this.model);
    },
    async add3dtiles() {
      this.tileset = await Cesium.Cesium3DTileset.fromUrl(
        `data/3dtiles/bim/tileset.json`,
        {
          maximumScreenSpaceError: 2,
          cullRequestsWhileMovingMultiplier: 100,
          dynamicScreenSpaceError: true,
          preferLeaves: true,
          debugShowBoundingVolume: false,
          debugShowContentBoundingVolume: false,
        }
      );
      this.viewer.scene.primitives.add(this.tileset);
      this.viewer.zoomTo(this.tileset);

      const bimEditCesium = new EditCesium(this.viewer, {
        rotateEnabled: true,
        translateEnabled: true,
      });
      bimEditCesium.addTo(this.tileset);
    },
  },
};
</script>
<style>
.control {
  position: absolute;
  z-index: 999;
  left: 10px;
  top: 10px;
}
</style>
