<template>
  <div>
    <div id="cesiumContainer"></div>

    <!-- Element UI 控制面板 -->
    <el-card class="control-panel" v-if="showControls">
      <div slot="header" class="clearfix">
        <span>3D 对象控制</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="toggleControls"
        >
          隐藏
        </el-button>
      </div>

      <!-- 点实体控制 -->
      <el-collapse v-model="activeNames">
        <el-collapse-item title="点实体控制" name="1">
          <div class="control-item">
            <el-checkbox
              v-model="pointControls.translateEnabled"
              @change="updatePointControls"
            >
              启用平移
            </el-checkbox>
          </div>
        </el-collapse-item>

        <!-- 模型控制 -->
        <el-collapse-item title="模型控制" name="2">
          <div class="control-item">
            <el-checkbox
              v-model="modelControls.rotateEnabled"
              @change="updateModelControls"
            >
              启用旋转
            </el-checkbox>
          </div>
          <div class="control-item">
            <el-checkbox
              v-model="modelControls.translateEnabled"
              @change="updateModelControls"
            >
              启用平移
            </el-checkbox>
          </div>
          <div class="control-item">
            <el-checkbox
              v-model="modelControls.scaleEnabled"
              @change="updateModelControls"
            >
              启用缩放
            </el-checkbox>
          </div>
        </el-collapse-item>

        <!-- 3D Tiles 控制 -->
        <el-collapse-item title="3D Tiles 控制" name="3">
          <div class="control-item">
            <el-checkbox
              v-model="tilesControls.rotateEnabled"
              @change="updateTilesControls"
            >
              启用旋转
            </el-checkbox>
          </div>
          <div class="control-item">
            <el-checkbox
              v-model="tilesControls.translateEnabled"
              @change="updateTilesControls"
            >
              启用平移
            </el-checkbox>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <!-- 显示/隐藏控制面板的按钮 -->
    <el-button
      v-if="!showControls"
      class="toggle-button"
      type="primary"
      icon="el-icon-s-operation"
      circle
      @click="toggleControls"
    ></el-button>
  </div>
</template>

<script>
import "cesium/Widgets/widgets.css";
import * as Cesium from "cesium/Cesium";
import EditCesium from "./js/EditCesium";

export default {
  data() {
    return {
      viewer: null,
      point: null,
      model: null,
      tileset: null,
      pointEditCesium: null,
      modelEditCesium: null,
      tilesEditCesium: null,
      showControls: true,
      activeNames: ["1", "2", "3"],
      pointControls: {
        translateEnabled: true,
      },
      modelControls: {
        rotateEnabled: true,
        translateEnabled: true,
        scaleEnabled: true,
      },
      tilesControls: {
        rotateEnabled: true,
        translateEnabled: true,
      },
    };
  },

  mounted() {
    Cesium.Ion.defaultAccessToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0ZjI1YWYwNS00ODJiLTQzOTYtYTA3My0zMzI3ODFiZTdkYzAiLCJpZCI6MjAzOTgsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NzczNDAzMjN9.s1TyB5DYncqM_xAF-ekua_P4fcZmmyeVR4hA9ec9G4Q";

    this.viewer = new Cesium.Viewer("cesiumContainer", {
      homeButton: false,
      vrButton: false,
      fullscreenButton: true,
      animation: true,
      geocoder: false,
      timeline: true,
      sceneModePicker: false,
      navigationHelpButton: false,
      infoBox: false,
      baseLayerPicker: false,
      selectionIndicator: true,
      shouldAnimate: true,
    });

    this.viewer._cesiumWidget._creditContainer.style.display = "none";
    this.viewer.animation.container.style.visibility = "hidden";
    this.viewer.timeline.container.style.visibility = "hidden";
     this.viewer.scene.globe.depthTestAgainstTerrain = false; //深度检测

    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(116.39643, 39.89863, 2000.0),
    });

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

      this.pointEditCesium = new EditCesium(this.viewer, {
        translateEnabled: this.pointControls.translateEnabled,
      });
      this.pointEditCesium.addTo(this.point);
    },

    updatePointControls() {
      if (this.pointEditCesium) {
        this.pointEditCesium.translateEnabled =
          this.pointControls.translateEnabled;
      }
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

      this.modelEditCesium = new EditCesium(this.viewer, {
        rotateEnabled: this.modelControls.rotateEnabled,
        translateEnabled: this.modelControls.translateEnabled,
        scaleEnabled: this.modelControls.scaleEnabled,
      });

      this.modelEditCesium.addTo(this.model);
    },

    updateModelControls() {
      if (this.modelEditCesium) {
        this.modelEditCesium.rotateEnabled = this.modelControls.rotateEnabled;
        this.modelEditCesium.translateEnabled =
          this.modelControls.translateEnabled;
        this.modelEditCesium.scaleEnabled = this.modelControls.scaleEnabled;
      }
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

      this.tilesEditCesium = new EditCesium(this.viewer, {
        rotateEnabled: this.tilesControls.rotateEnabled,
        translateEnabled: this.tilesControls.translateEnabled,
      });

      this.tilesEditCesium.addTo(this.tileset);
    },

    updateTilesControls() {
      if (this.tilesEditCesium) {
        this.tilesEditCesium.rotateEnabled = this.tilesControls.rotateEnabled;
        this.tilesEditCesium.translateEnabled =
          this.tilesControls.translateEnabled;
      }
    },

    toggleControls() {
      this.showControls = !this.showControls;
    },
  },
};
</script>

<style scoped>
.control-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 300px;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.9);
}

.toggle-button {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.control-item {
  margin-bottom: 10px;
}
</style>
