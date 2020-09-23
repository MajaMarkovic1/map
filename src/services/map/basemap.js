import "ol/ol.css";
import Vue from "vue";
import {Map, View} from "ol";
import TileLayer from "ol/layer/Tile";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import {optionsFromCapabilities} from "ol/source/WMTS";
import GoogleLayer from "olgm/layer/Google.js";
import OLGoogleMaps from "olgm/OLGoogleMaps.js";
import Feature from "ol/Feature";
import {Point, MultiLineString, Polygon, LineString, Circle as CircleString} from "ol/geom";
import {Style, Icon, Circle, Fill, Stroke, Text} from "ol/style";
import {Vector as VectorSource, Cluster, OSM, WMTS} from "ol/source";
import {Vector as VectorLayer} from "ol/layer";
import {M2wApi} from "../m2w_api";
import {ScaleLine} from "ol/control";
import Draw, {createBox} from "ol/interaction/Draw";
import Overlay from "ol/Overlay";
import {getArea, getLength} from "ol/sphere";
import {unByKey} from "ol/Observable";
import {getTransform} from "ol/proj";
import {createEmpty, extend, getCenter} from "ol/extent";
import Select from "ol/interaction/Select";
import CircleStyle from "ol/style/Circle";
import {pointerMove} from "ol/events/condition";
import GeoJSON from "ol/format/GeoJSON";

export default class Basemap {
  constructor() {
    this.parser = new WMTSCapabilities();
    this.allLayers = [];
    this.googleLayers = [];
    this.activeLayer = 0;
    this.host_address = M2wApi.host_address;
    this.vectorArray = [];
  }

  async initMap() {
    this.allLayers.push(...Vue.config.project.base_layers);
    this.activeLayer = this.allLayers.find(x => x.is_default).id;
    this.googleLayers = this.allLayers.filter(layer => layer.name.includes("Google"));
    await this.setupMap(
      Vue.config.project.default_base_layer,
      Vue.config.project.min_zoom,
      Vue.config.project.max_zoom
    );
  }

  addMarkerLayer(coordinates, markerUrl) {
    let marker = new Feature({
      geometry: new Point(coordinates)
    });
    let markerStyle = new Style({
      image: new Icon({
        anchor: [0.5, 20],
        anchorXUnits: "fraction",
        anchorYUnits: "pixels",
        src: this.host_address + markerUrl,
      })
    });
    marker.setStyle(markerStyle);
    let vectorSource = new VectorSource({
      features: [marker]
    });
    let vectorLayer = new VectorLayer({
      source: vectorSource
    });
 
    this.map.addLayer(vectorLayer);
    return vectorLayer;
  }

  addPolygonLayer(geom, polyStyle, parentStyle, el = null, onclickCallback = null) {
    let poly = new Feature({
      geometry: new GeoJSON().readGeometry(geom),
      poiElement: el
    });
    function toRgba(color, transparency) {
      let opacity = Math.floor((1-(transparency/100)) * 255);
      let value = color + opacity.toString(16);
      return value;
    }
    let style = new Style({
        stroke: new Stroke({
          color: toRgba(polyStyle.line_color, polyStyle.line_transparency),
          width: polyStyle.line_thickness,
        }),
        fill: new Fill({
          color: toRgba(polyStyle.fill_color, polyStyle.fill_transparency),
        }),
      });

    poly.setStyle(style);
    let vectorSource = new VectorSource({
      features: [poly]
    });
    let vectorLayer = new VectorLayer({
      source: vectorSource,
      styles: [style]
    });
    this.map.addLayer(vectorLayer);

    vectorLayer.interactions = [];
    if(parentStyle){
      let select = new Select({
        condition: pointerMove,
        layers: [vectorLayer],
        style: new Style({
          stroke: new Stroke({
            color: toRgba(parentStyle.line_color, parentStyle.line_transparency),
            width: parentStyle.line_thickness,
          }),
          fill: new Fill({
            color: toRgba(parentStyle.fill_color, parentStyle.fill_transparency),
          })
        })
      });
      this.map.addInteraction(select);
      vectorLayer.interactions.push(select);
    }

    if(onclickCallback){
      let clickInteraction = new Select({
        condition: evt => evt.type === 'click',
        layers: [vectorLayer]
      });
      clickInteraction.on('select', (e) => {
        if(!e.selected.length)
          return;

        let elem = e.selected[0].get('poiElement');
        onclickCallback(elem);
      });
      this.map.addInteraction(clickInteraction);
      vectorLayer.interactions.push(clickInteraction);
    }

    return vectorLayer;
  }

  createMarkerForCoordinates(coordinates) {
    return this.addMarkerLayer(coordinates, "static/uploads/markers/4735turquoise_pinpoint2.png", null)[0];
  }

  createViewForPoi(poi, onclickCallback = null) {
    // always delete potential old makers
    this.deleteView(poi);
    switch(poi.geom.type){
      case "Point":
        poi.viewLayer = this.addMarkerLayer(poi.geom.coordinates, poi.marker);
        break;
      case "Polygon":
      case "MultiPolygon":
        poi.viewLayer = this.addPolygonLayer(poi.geom, poi.style, poi.parent.style, poi, onclickCallback);
        break;
    }

    return getCenter(poi.viewLayer.getSource().getExtent());
  }

  setCluster(category, color, onclickCallback) {
    this.deleteCluster(category);

    // TOC-Tree: category.children
    // Search: category.pois
    let pois = (category.children || category.pois || []).filter(el => el.geom);

    pois.filter(el => el.geom.type !== "Point")
      .forEach(el => this.createViewForPoi(el, onclickCallback))

    // point items go into a cluster
    let features = pois.filter(el => el.geom.type === "Point")
      .map(el => new Feature({
        geometry: new Point(el.geom.coordinates),
        poiElement: el
      }));

    let clusterSource = new Cluster({
      distance: 60,
      source: new VectorSource({features: features}),
    });

    function buildSinglePoiStyle(feature) {
      return new Style({
        geometry: feature.getGeometry(),
        image: new Icon({
          anchor: [0.5, 20],
          anchorXUnits: "fraction",
          anchorYUnits: "pixels",
          // in search, features themselves have markers, in the TOC, only the parent does.
          src: M2wApi.host_address + (feature.get('poiElement').marker || category.marker),
        })
      });
    }

    let clusters = new VectorLayer({
      source: clusterSource,
      style: function(feature) {
        let size = feature.get("features").length;

        // single POI
        if(size === 1)
          return buildSinglePoiStyle(feature.get("features")[0]);

        // cluster
        let radius = Math.min(20 + size, 30);
        return new Style({
          image: new Circle({
            radius: radius,
            stroke: new Stroke({
              color: "#fff"
            }),
            fill: new Fill({
              color: color
            })
          }),
          text: new Text({
            text: size.toString(),
            fill: new Fill({
              color: "#fff"
            })
          })
        });
      }
    });
    category["cluster"] = clusters;
    this.map.addLayer(clusters);


    let clickInteraction = new Select({
      condition: evt => evt.type === 'click',
      layers: [clusters],
      style: function (feature) {
        let features = feature.get('features');

        let styles = [
          new Style({
            image: new CircleStyle({
              radius: feature.get('radius'),
              fill: new Fill({color: 'rgba(255, 255, 255, 0.01)'}),
            }),
          }) ];
        return styles.concat(features.map(f => buildSinglePoiStyle(f)));
      }
    });

    if(onclickCallback){
      clickInteraction.on('select', (e) => {
        if(!e.selected.length)
          return;

        let features = e.selected[0].get('features');
        if(features.length !== 1)
          return

        let elem = features[0].get('poiElement');
        onclickCallback(elem);
      });
    }

    category["interaction"] = clickInteraction;
    this.map.addInteraction(clickInteraction);
  }

  setCircleMarkerStyle(category) {
    if (category.highLightLayer)
      this.map.getLayers().remove(category.highLightLayer);

    let markerStyle = new Style({
      image: new Circle({
        fill: new Fill({
          color: "rgba(70, 134, 229, 0.3)"
        }),
        radius: 45
      })
    });

    let source = new VectorSource({
      features: [new Feature({geometry: new Point(category.geom.coordinates)})]
    });

    let vectorLayer = new VectorLayer({
      source: source,
      style: markerStyle,
      zIndex: 2
    });
    this.map.addLayer(vectorLayer);

    category.highLightLayer = vectorLayer;
  }

  deleteMarkers(pois) {
    if (!pois) return;

    let map = this.map;
    pois.forEach(element => {
      this.vectorArray.push(...map.getLayers().array_.filter(el => el === element.viewLayer));
      this.vectorArray.push(...map.getLayers().array_.filter(el => el === element.highLightLayer));
    });

    // delete all other vector layers
    this.vectorArray.forEach(element => {
      map.removeLayer(element);
    });
  }

  deleteView(poi) {
    if (!poi || !poi.viewLayer)
      return;

    if(poi.viewLayer.interactions)
      poi.viewLayer.interactions.forEach(i => this.map.removeInteraction(i));

    this.map.removeLayer(poi.viewLayer);
    poi.viewLayer = null;
  }

  deleteOverlayMarker(category) {
    this.map.getLayers().remove(category.highLightLayer);
  }

  deleteCluster(category) {
    if (category.cluster)
      this.map.removeLayer(category.cluster);

    if(category.interaction)
      this.map.removeInteraction(category.interaction);

    // get rid of other types of pois
    (category.children || category.pois || [])
      .filter(el => el.geom)
      .filter(el => el.geom.type !== "Point")
      .forEach(el => this.deleteView(el))

    category.cluster = null;
    category.interaction = null;
  }

  drawLine(geom, strokeOptions={color:"rgba(255,0,0,1)", width:3}) {
    let line = new Feature({
      geometry: new MultiLineString(geom.coordinates)
    });

    return this.drawLineInternal(line, strokeOptions);
  }

  drawEpsg4326Line(geom, strokeOptions={color:"rgba(255,0,0,1)", width:3}){
    let transform = getTransform("EPSG:4326", "EPSG:3857");
    geom = geom.map(c => transform([c.lng(), c.lat()]));

    let line = new Feature({
      geometry: new MultiLineString([geom])
    });

    return this.drawLineInternal(line, strokeOptions);
  }

  updateStyle(layer, strokeOptions){
    layer.setStyle(new Style({
        stroke: new Stroke(strokeOptions)
      }));
  }

  drawLineInternal(line, strokeOptions) {
    let source = new VectorSource({
      features: [line]
    });
    let style = new Style({
      stroke: new Stroke(strokeOptions)
    });
    let vectorLayer = new VectorLayer({
      source: source,
      style: style
    });
    this.map.addLayer(vectorLayer);
    return vectorLayer;
  }

  async setupMap(layer_id, minZoom, maxZoom) {
    let layers = [];
    if(Vue.config.project.sf_basemap)
      layers.push(Vue.config.project.sf_basemap.layer)

    this.map = new Map({
      target: "map",
      layers: layers,
      view: new View({
        center: Vue.config.project.center,
        zoom: 16,
        constrainResolution: true,
        minZoom: minZoom,
        maxZoom: maxZoom
      })
    });
    this.map.addControl(new ScaleLine());
    // if basemap is google map, activate olgm layer
    let olGM = new OLGoogleMaps({
      map: this.map,
      watch: {
        tile: false,
        vector: false
      }
    });
    olGM.activate();
    this.setupSettingsButtons();
    await this.changeBasemap(layer_id, false);
  }

  setupSettingsButtons() {
    if (document.getElementsByClassName("ol-zoom")[0] && document.getElementById("setting-buttons")) {
      let buttonsFrame = document.getElementsByClassName("ol-zoom")[0];
      let layerButton = document.getElementById("setting-buttons");
      buttonsFrame.appendChild(layerButton);
      layerButton.style.display = "block";
    }
  }

  async changeBasemap(layer_id, override = true) {
    this.activeLayer = layer_id;
    const layer = this.allLayers.find(l => l.id === layer_id);
    let olLayer = null;
    if (layer.lyid === "osm")
      olLayer = await this.getOsmLayer();
    else if (this.googleLayers.includes(layer))
      olLayer = await this.getGoogleLayer(layer);
    else
      olLayer = await this.getWmtsLayer(layer);

    const existingLayers = this.map.getLayers();
    if (override) existingLayers.setAt(0, olLayer);
    else existingLayers.insertAt(0, olLayer);
  }

  async getOsmLayer() {
    return new TileLayer({source: new OSM()});
  }

  async getGoogleLayer(layer) {
    this.map.getView().setMinZoom(0);
    return new GoogleLayer({mapTypeId: layer.lyid});
  }

  async getWmtsLayer(layer) {
    const response = await fetch(layer.url);
    const text = await response.text();

    let result = this.parser.read(text);
    let options = optionsFromCapabilities(result, {
      layer: layer.lyid ?? layer.name,
      matrixSet: result.Contents.TileMatrixSet[0].Identifier
    });
    return new TileLayer({source: new WMTS(options)});
  }

  print() {
    let v_context_el = document.getElementsByClassName("v-context")[0];
    let zooms = document.getElementsByClassName("ol-zoom");
    let menu_popup = document.getElementById("lhs_wrapper");
    let measure_popup = document.getElementById("measure-popup");
    let control_popup = document.getElementById("control-popup");
    let framesManipulation = function(val) {
      if (measure_popup) {
        measure_popup.style.display = val;
      }
      menu_popup.style.display = control_popup.style.display = val;
      zooms.forEach(element => {
        element.style.display = val;
      });
    }
    framesManipulation("none")
    v_context_el.style.display = "none"
    window.print();
    framesManipulation("block")
  }

  async addCategoryLayer(category) {
    if(!category.layer)
      return;

    if(category.catLayer)
      this.deleteCategoryLayer(category);

    let newLayer = await this.getWmtsLayer(category.layer);
    this.map.addLayer(newLayer);
    category.catLayer = newLayer;
  }

  deleteCategoryLayer(category){
    if(category.catLayer) {
      this.map.removeLayer(category.catLayer);
      category.catLayer = null;
    }
  }

  startMeasurement(type, color, id) {
    let source = new VectorSource();
    let vector = new VectorLayer({
      source: source,
      style: new Style({
        fill: new Fill({
          color: "rgba(255, 255, 255, 0.6)"
        }),
        stroke: new Stroke({
          color: color,
          width: 2
        })
      })
    });
    this.map.addLayer(vector);

    let target = {
      id: id,
      type: type,
      layer: vector,
      area: 0,
      length: 0,
      radius: 0,
      drawing: null,
      tooltip: null,
      tooltipElement: null,
      onFinish: null,
      cancel: () => {
        if(target.onFinish)
          target.onFinish();
        target.drawing.abortDrawing();
        this.map.removeInteraction(target.drawing);
        this.map.removeOverlay(target.tooltip);
        this.map.removeLayer(target.layer);
      },
      remove: () => {
        this.map.removeOverlay(target.tooltip);
        this.map.removeLayer(target.layer);
      }
    }

    function createMeasureTooltip(map) {
      target.tooltipElement = document.createElement("div");
      target.tooltipElement.className = "ol-tooltip ol-tooltip-measure";
      target.tooltipElement.style.borderColor = color;
      target.tooltip = new Overlay({
        element: target.tooltipElement,
        offset: [0, -15],
        positioning: "bottom-center"
      });
      map.addOverlay(target.tooltip);
    }
    function addInteractionFun(map, type) {
      let geometryFunction;
      if (type === "Box") {
        type = "Circle";
        geometryFunction = createBox();
      }
      let draw = new Draw({
        source: source,
        type: type,
        geometryFunction: geometryFunction,
        style: new Style({
          fill: new Fill({
            color: "rgba(255, 255, 255, 0.5)"
          }),
          stroke: new Stroke({
            // color: 'rgba(0, 0, 0, 0.5)',
            color: color,
            lineDash: [10, 5],
            width: 1
          }),
          image: new Circle({
            radius: 5,
            stroke: new Stroke({
              color: "rgba(0, 0, 0, 0.7)"
            }),
            fill: new Fill({
              color: "rgba(255, 255, 255, 0.2)"
            })
          })
        })
      });

      map.addInteraction(draw);
      createMeasureTooltip(map);
      let listener;
      draw.on("drawstart", function(evt) {
        let sketch = evt.feature;
        let tooltipCoord = evt.coordinate;
        listener = sketch.getGeometry().on("change", function(evt) {
          let geom = evt.target;
          if (geom instanceof Polygon) {
            target.length = getLength(geom);
            target.area = getArea(geom);
            tooltipCoord = geom.getInteriorPoint().getCoordinates();
          } else if (geom instanceof LineString) {
            target.length = getLength(geom);
            tooltipCoord = geom.getLastCoordinate();
          } else if (geom instanceof CircleString) {
            target.radius = geom.getRadius();
            target.area = target.radius * target.radius * Math.PI;
            target.length = 2 * target.radius * Math.PI;
            tooltipCoord = geom.getFirstCoordinate();
          }
          if (target.tooltipElement) {
            target.tooltipElement.innerHTML = target.id;
            target.tooltip.setPosition(tooltipCoord);
          }
        });
      });
      draw.on("drawabort", function(){
        unByKey(listener);
      })
      draw.on("drawend", function() {
        if(target.onFinish)
          target.onFinish();
        target.tooltipElement.className = "ol-tooltip ol-tooltip-static";
        target.tooltip.setOffset([0, -7]);
        target.tooltipElement = null;
        unByKey(listener);
        map.removeInteraction(draw);
      });
      return draw;
    }

    target.drawing = addInteractionFun(this.map, type);
    return target;
  }

  zoomToExtent(extents) {
    let extent = createEmpty();
    for(let ex of extents)
      extend(extent, ex);
    this.map.getView().fit(extent, this.map.getSize());
  }

  drawEpsg4326Circle(waypoints, radius= 3, width = 3) {
    let transform = getTransform("EPSG:4326", "EPSG:3857");
    waypoints = waypoints
      .map(p => transform([p.lng(), p.lat()]))
      .map(p => new Feature({geometry: new Point(p)}));

    let source = new VectorSource({
      features: waypoints
    });
    let style = new Style({
      image: new Circle({
        radius: radius,
        fill: new Fill({color:"white"}),
        stroke: new Stroke({
          color: "rgba(100,100,100,1)",
          width: width
        })
      })
    });
    let vectorLayer = new VectorLayer({
      source: source,
      style: style,
      zIndex: 2
    });
    this.map.addLayer(vectorLayer);
    return vectorLayer;
  }
}
export const basemap = new Basemap();
