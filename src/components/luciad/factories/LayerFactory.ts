import {UrlTileSetModel} from "@luciad/ria/model/tileset/UrlTileSetModel";
import {RasterTileSetLayer} from "@luciad/ria/view/tileset/RasterTileSetLayer";
import {LonLatGrid} from "@luciad/ria/view/grid/LonLatGrid";
import {GridLayer} from "@luciad/ria/view/grid/GridLayer";
import { OgcOpenApiTilesModel } from "ogcopenapis/lib/OgcOpenApiTilesModel";
import {OgcOpenApiMapsModel} from "ogcopenapis/lib//OgcOpenApiMapsModel";
import {FeatureModel} from "@luciad/ria/model/feature/FeatureModel";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";


class LayerFactory {

    public createOpenApiFeaturesLayer(model: FeatureModel,  layerOptions: any) {
        return new Promise<FeatureLayer>((resolve)=>{
            const layer = new FeatureLayer(model, layerOptions);
            resolve(layer);
        })
    };

    public createGridLayer(model:LonLatGrid, layerOptions: any) {
        const lo = layerOptions!=="undefined" ? layerOptions : {label:"Grid"};
        const options = {...lo};
        return new Promise<GridLayer>((resolve, reject) => {
            options.label = options.label ? options.label : "Grid";
            options.id = options.id ? options.id : "Grid";
            options.visibleInTree = typeof options.visibleInTree !== "undefined" ? options.visibleInTree : false;
            const layer = new GridLayer(model, options);
            if (layer) {
                resolve(layer)
            } else {
                reject();
            }
        });
    }

    public createTMSLayer(model: UrlTileSetModel, layerOptions: any) {
        return new Promise<RasterTileSetLayer>((resolve)=>{
            const layer = new RasterTileSetLayer(model, layerOptions);
            resolve(layer);
        })
    }

    public createOpenApiTilesLayer(model: OgcOpenApiTilesModel, layerOptions: any) {
        return new Promise<RasterTileSetLayer>((resolve)=>{
            const layer = new RasterTileSetLayer(model, layerOptions);
            resolve(layer);
        })
    }

    public createOpenApiMapsLayer(model: OgcOpenApiMapsModel, layerOptions: any) {
        return new Promise<RasterTileSetLayer>((resolve)=>{
            const layer = new RasterTileSetLayer(model, layerOptions);
            resolve(layer);
        })
    }
}

export {
    LayerFactory
}