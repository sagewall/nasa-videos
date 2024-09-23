import "@arcgis/core/assets/esri/themes/light/main.css";
import esriConfig from "@arcgis/core/config";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import Extent from "@arcgis/core/geometry/Extent";
import esriId from "@arcgis/core/identity/IdentityManager";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";
import type Layer from "@arcgis/core/layers/Layer";
import MediaLayer from "@arcgis/core/layers/MediaLayer";
import ControlPointsGeoreference from "@arcgis/core/layers/support/ControlPointsGeoreference";
import ExtentAndRotationGeoreference from "@arcgis/core/layers/support/ExtentAndRotationGeoreference";
import VideoElement from "@arcgis/core/layers/support/VideoElement";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer";
import Map from "@arcgis/core/Map";
import Portal from "@arcgis/core/portal/Portal";
import PortalItem from "@arcgis/core/portal/PortalItem";
import MapView from "@arcgis/core/views/MapView";
import WebMap from "@arcgis/core/WebMap";
import "@esri/calcite-components/dist/calcite/calcite.css";
import { setAssetPath } from "@esri/calcite-components/dist/components";
import "@esri/calcite-components/dist/components/calcite-button";
import "@esri/calcite-components/dist/components/calcite-select";
import "@esri/calcite-components/dist/components/calcite-option";
import "@esri/calcite-components/dist/components/calcite-input";
import "@esri/calcite-components/dist/components/calcite-input-number";
import "@esri/calcite-components/dist/components/calcite-label";
import "@esri/calcite-components/dist/components/calcite-link";
import "@esri/calcite-components/dist/components/calcite-navigation";
import "@esri/calcite-components/dist/components/calcite-navigation-logo";
import "@esri/calcite-components/dist/components/calcite-navigation-user";
import "@esri/calcite-components/dist/components/calcite-select";
import "@esri/calcite-components/dist/components/calcite-shell";
import "@esri/calcite-components/dist/components/calcite-shell-panel";
import "@esri/calcite-components/dist/components/calcite-slider";
import "@esri/calcite-components/dist/components/calcite-switch";
import "./style.css";

// @ts-expect-error undocumented
import * as mediaUtils from "@arcgis/core/layers/support/mediaUtils";
// @ts-expect-error undocumented
import * as editingTools from "@arcgis/core/views/2d/interactive/editingTools";

setAssetPath("https://js.arcgis.com/calcite-components/2.12.2/assets");

esriConfig.portalUrl = "https://devtesting.mapsdevext.arcgis.com/";
// esriConfig.portalUrl = "https://jsapi.maps.arcgis.com/";

// -------------------------------------------------------------------
// References to HTML elements
// -------------------------------------------------------------------

const controlPointsDiv = document.querySelector(
  "#control-points-div"
) as HTMLDivElement;

const controlPointsLocalButton = document.querySelector(
  "#control-points-local-button"
) as HTMLCalciteButtonElement;

const controlPointsLocalHideButton = document.querySelector(
  "#control-points-local-hide-button"
) as HTMLCalciteButtonElement;

const cpxInput = document.querySelector(
  "#cpx-input"
) as HTMLCalciteInputElement;

const cpyInput = document.querySelector(
  "#cpy-input"
) as HTMLCalciteInputElement;

const importMediaButton = document.querySelector(
  "#import-media-button"
) as HTMLCalciteButtonElement;

const mapDiv = document.querySelector("#map-div") as HTMLDivElement;

const mediaLayerLink = document.querySelector(
  "#media-layer-link"
) as HTMLCalciteLinkElement;

const mediaLayerSaveLabel = document.querySelector(
  "#media-layer-save-label"
) as HTMLCalciteLabelElement;

const resetButton = document.querySelector(
  "#reset-button"
) as HTMLCalciteButtonElement;

const restartButton = document.querySelector(
  "#restart-button"
) as HTMLCalciteButtonElement;

const saveDiv = document.querySelector("#save-div") as HTMLDivElement;

const saveButton = document.querySelector(
  "#save-button"
) as HTMLCalciteButtonElement;

const sliderDiv = document.querySelector("#slider-div") as HTMLDivElement;

const spatialReferenceSelect = document.querySelector(
  "#spatial-reference-select"
) as HTMLCalciteSelectElement;

const transparencySlider = document.querySelector(
  "#transparency-slider"
) as HTMLCalciteSliderElement;

const sourceDiv = document.querySelector("#source-div") as HTMLDivElement;

const titleInput = document.querySelector(
  "#title-input"
) as HTMLCalciteInputElement;

const videoUrlInput = document.querySelector(
  "#video-url-input"
) as HTMLCalciteInputElement;

const webMapLink = document.querySelector(
  "#webmap-link"
) as HTMLCalciteLinkElement;

const webMapSaveLabel = document.querySelector(
  "#webmap-save-label"
) as HTMLCalciteLabelElement;

// -------------------------------------------------------------------
// Variables
// -------------------------------------------------------------------

let arcgisMap: HTMLArcgisMapElement;
let mediaLayer: MediaLayer;
let sourceView: MapView;
let tool: editingTools.MediaTransformToolsWrapper;
let videoElement: VideoElement;
let webMap: WebMap;

// -------------------------------------------------------------------
// Main
// -------------------------------------------------------------------
init();

// -------------------------------------------------------------------
// Functions
// -------------------------------------------------------------------

async function importMedia() {
  const view = arcgisMap.view;

  // @ts-expect-error undocumented
  view.tools.removeAll();

  arcgisMap.map.layers.forEach((layer: Layer) => {
    layer.type === "media" && arcgisMap.map.layers.remove(layer);
  });

  const videoUrl = videoUrlInput?.value;
  videoElement = new VideoElement({
    video: videoUrl,
  });

  let georeference: ExtentAndRotationGeoreference;

  if (spatialReferenceSelect.value === "4326") {
    georeference = new ExtentAndRotationGeoreference({
      extent: new Extent({
        spatialReference: {
          wkid: Number(spatialReferenceSelect.value),
        },
        xmin: -180,
        ymin: -90,
        xmax: 180,
        ymax: 90,
      }),
    });
  } else {
    georeference = new ExtentAndRotationGeoreference({
      extent: new Extent({
        xmin: -14694172,
        ymin: 0,
        xmax: -1335833,
        ymax: 8400000,
        spatialReference: {
          wkid: 3857,
        },
      }),
    });
  }

  // @ts-expect-error undocumented
  await videoElement.load();
  const controlPointsGeoreference = mediaUtils.toControlPointsGeoreference(
    georeference,
    videoElement.content.videoWidth,
    videoElement.content.videoHeight
  );
  videoElement.georeference = controlPointsGeoreference;

  mediaLayer = new MediaLayer({
    source: videoElement,
  });
  arcgisMap.addLayer(mediaLayer);

  await view.when();
  await mediaLayer.load();
  // @ts-expect-error undocumented
  await videoElement.load();
  // @ts-expect-error undocumented
  await view.goTo(videoElement.georeference.coords.extent.expand(1.2));

  const editingElement = new VideoElement({
    video: videoElement.video,
    georeference:
      mediaUtils.createLocalModeControlPointsGeoreference(videoElement),
  });

  const editingMediaLayer = new MediaLayer({
    source: [editingElement],
    effect: "drop-shadow(0, 10px, 20px, black)",
  });

  sourceView.map.layers.add(editingMediaLayer);

  // @ts-expect-error undocumented
  sourceView.extent = editingElement.georeference.coords.extent.expand(1.2);
  sourceView.constraints = {
    snapToZoom: false,
    // @ts-expect-error undocumented
    geometry: editingElement.georeference.coords.extent,
  };

  tool = new editingTools.MediaTransformToolsWrapper({
    mediaElement: videoElement,
    view,
    advancedMode: {
      mediaElement: editingElement,
      view: sourceView,
    },
  });

  videoUrlInput!.disabled = true;

  controlPointsLocalButton.style.display = "block";
  resetButton.style.display = "block";
  saveDiv.style.display = "block";
  sliderDiv.style.display = "block";
}

async function init() {
  const signInButton =
    document.querySelector<HTMLCalciteButtonElement>("#sign-in-button");

  const navigationUser =
    document.querySelector<HTMLCalciteNavigationUserElement>(
      "calcite-navigation-user"
    );

  signInButton!.addEventListener("click", () => {
    signInOrOut();
  });

  navigationUser!.addEventListener("click", () => {
    signInOrOut();
  });

  const info = new OAuthInfo({
    appId: import.meta.env.VITE_APP_ID,
    portalUrl: esriConfig.portalUrl,
    popup: false,
  });

  esriId.registerOAuthInfos([info]);

  try {
    await esriId.checkSignInStatus(info.portalUrl + "/sharing");
    navigationUser!.hidden = false;
    signInButton!.hidden = true;

    const portal = new Portal();
    portal.authMode = "immediate";
    await portal.load();

    navigationUser!.fullName = portal.user.fullName;
    navigationUser!.username = portal.user.username;

    load();
  } catch (error) {
    if ((error as Error).name === "identity-manager:not-authenticated") {
      signInButton!.hidden = false;
      navigationUser!.hidden = true;
      destroy();
    } else {
      console.error(error);
    }
  }

  async function destroy() {
    const arcgisMap = document.querySelector("arcgis-map");
    arcgisMap?.remove();
  }

  async function signInOrOut() {
    try {
      await esriId.checkSignInStatus(info.portalUrl + "/sharing");
      esriId.destroyCredentials();
      window.location.reload();
    } catch (error) {
      if ((error as Error).name === "identity-manager:not-authenticated") {
        esriId.getCredential(info.portalUrl + "/sharing");
      }
    }
  }
}

function addBasemapGallery(target: HTMLElement) {
  const expand = document.createElement("arcgis-expand");
  expand.id = "basemap-gallery-expand";
  expand.position = "top-right";
  const basemapGallery = document.createElement("arcgis-basemap-gallery");
  expand.appendChild(basemapGallery);
  target.appendChild(expand);
}
async function load() {
  // -------------------------------------------------------------------
  // Map and view
  // -------------------------------------------------------------------
  await import("@arcgis/map-components/dist/components/arcgis-map");
  await import("@arcgis/map-components/dist/components/arcgis-expand");
  await import("@arcgis/map-components/dist/components/arcgis-basemap-gallery");

  arcgisMap = document.createElement("arcgis-map");

  webMap = new WebMap({
    basemap: "topo-vector",
  });
  arcgisMap.map = webMap;
  addBasemapGallery(arcgisMap);

  sourceView = new MapView({
    container: sourceDiv,
    map: new Map(),
  });

  mapDiv?.appendChild(arcgisMap);

  // -------------------------------------------------------------------
  // Event listeners
  // -------------------------------------------------------------------

  controlPointsLocalButton.addEventListener("click", async () => {
    controlPointsLocalHideButton.style.display = "block";
    sourceDiv.style.flexGrow = "1";
    controlPointsDiv.style.display = "block";
    controlPointsLocalButton.style.display = "none";

    reactiveUtils.watch(
      () => [
        (videoElement.georeference as ControlPointsGeoreference).controlPoints,
        tool.activeHandle,
      ],
      () => {
        cpxInput.value = (
          videoElement.georeference as ControlPointsGeoreference
        ).controlPoints[tool.activeHandle].mapPoint!.x.toString();
        cpyInput.value = (
          videoElement.georeference as ControlPointsGeoreference
        ).controlPoints[tool.activeHandle].mapPoint!.y.toString();
      },
      {
        initial: true,
      }
    );

    await tool.enableAdvancedMode();

    transparencySlider.value = 100 - videoElement.opacity * 100;
  });

  controlPointsLocalHideButton.addEventListener("click", async () => {
    transparencySlider.value = 0;
    sourceDiv.style.flexGrow = "0";
    controlPointsLocalHideButton.style.display = "none";
    controlPointsDiv.style.display = "none";
    controlPointsLocalButton.style.display = "block";
    tool.disableAdvancedMode();
  });

  cpxInput.addEventListener("input", () => {
    (videoElement.georeference as ControlPointsGeoreference).controlPoints[
      tool.activeHandle
    ].mapPoint!.x = Number(cpxInput.value);
    tool.refresh();
  });

  cpyInput.addEventListener("input", () => {
    (videoElement.georeference as ControlPointsGeoreference).controlPoints[
      tool.activeHandle
    ].mapPoint!.y = Number(cpyInput.value);
    tool.refresh();
  });

  importMediaButton.addEventListener("click", () => {
    if (arcgisMap.ready) {
      importMedia();
    } else {
      arcgisMap.addEventListener("arcgisViewReadyChange", () => {
        importMedia();
      });
    }
  });

  resetButton.addEventListener("click", async () => {
    tool.reset();
    transparencySlider.value = 0;
    videoElement.opacity = 1;
  });

  restartButton.addEventListener("click", async () => {
    window.location.reload();
  });

  saveButton.addEventListener("click", async () => {
    const savedMediaLayerPortalItem = await mediaLayer.saveAs(
      new PortalItem({
        title: `${titleInput.value} MediaLayer`,
      })
    );

    mediaLayerSaveLabel.style.display = "block";
    console.log("savedMediaLayerPortalItem", savedMediaLayerPortalItem);
    mediaLayerLink.href = `${esriConfig.portalUrl}/home/item.html?id=${savedMediaLayerPortalItem.id}`;
    mediaLayerLink.textContent = "MediaLayer";

    await webMap.updateFrom(arcgisMap.view);
    const savedWebMapPortalItem = await webMap.saveAs(
      new PortalItem({ title: `${titleInput.value} WebMap` })
    );
    console.log("savedWebMapPortalItem", savedWebMapPortalItem);
    webMapSaveLabel.style.display = "block";

    webMapLink.href = `${esriConfig.portalUrl}/home/item.html?id=${savedWebMapPortalItem.id}`;
    webMapLink.textContent = "WebMap";
  });

  spatialReferenceSelect.addEventListener("calciteSelectChange", (event) => {
    const basemapGallery = document.querySelector("#basemap-gallery-expand");
    const wkid = Number(event.target.value);

    if (wkid !== arcgisMap.view.spatialReference.wkid) {
      switch (wkid) {
        case 4326:
          const vectorTileLayer = new VectorTileLayer({
            url: "https://basemapsdev.arcgis.com/arcgis/rest/services/World_Basemap_GCS_v2/VectorTileServer",
          });
          webMap = new WebMap({
            basemap: {
              baseLayers: [vectorTileLayer],
            },
          });
          arcgisMap.map = webMap;

          videoUrlInput.value =
            "https://sagewall.github.io/test-images/MC03_stage4_GMAO_CO_2048x1024_en.mp4";

          if (basemapGallery) {
            basemapGallery.remove();
          }
          break;

        case 102100:
          webMap = new WebMap({
            basemap: "topo-vector",
          });
          arcgisMap.map = webMap;

          videoUrlInput.value =
            "https://sagewall.github.io/test-images/North.mp4";

          if (!basemapGallery) {
            addBasemapGallery(arcgisMap);
          }
          break;

        default:
          break;
      }
    }
  });

  transparencySlider.addEventListener("calciteSliderInput", (event) => {
    const val = event.target.value as number;
    videoElement.opacity = (100 - val) / 100;
  });
}
