import {UrlTileSetModel} from "@luciad/ria/model/tileset/UrlTileSetModel";
import {createBounds} from "@luciad/ria/shape/ShapeFactory";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";
import {LonLatGrid} from "@luciad/ria/view/grid/LonLatGrid";
import {LonLatPointFormat} from "@luciad/ria/shape/format/LonLatPointFormat";
import { OgcOpenApiTilesModel } from "ogcopenapis/lib/OgcOpenApiTilesModel";
import {OgcOpenApiMapsModel} from "ogcopenapis/lib//OgcOpenApiMapsModel";
import {FeatureModel} from "@luciad/ria/model/feature/FeatureModel";
import {OgcOpenApiFeatureStore, OgcOpenApiFeatureStoreConstructorOptions} from "ogcopenapis/lib/OgcOpenApiFeatureStore";
import {GeoJsonCodec} from "@luciad/ria/model/codec/GeoJsonCodec";
import {OgcOpenApiCrsTools} from "ogcopenapis/lib/OgcOpenApiCrsTools";


const DefaultGridSettings = {
    settings: [
        {scale: 40000.0E-9, deltaLon: 1 / 60, deltaLat: 1 / 60},
        {scale: 20000.0E-9, deltaLon: 1 / 30, deltaLat: 1 / 30},
        {scale: 10000.0E-9, deltaLon: 1 / 10, deltaLat: 1 / 10},
        {scale: 5000.0E-9, deltaLon: 1 / 2, deltaLat: 1 / 2},
        {scale: 1000.0E-9, deltaLon: 1, deltaLat: 1},
        {scale: 200.0E-9, deltaLon: 5, deltaLat: 5},
        {scale: 20.0E-9, deltaLon: 10, deltaLat: 10},
        {scale: 9.0E-9, deltaLon: 20, deltaLat: 20},
        {scale: 5.0E-9, deltaLon: 30, deltaLat: 30},
        {scale: 0, deltaLon: 45, deltaLat: 45}
    ],
    options: undefined as any,
    fallbackStyle: {
        labelFormat: new LonLatPointFormat({pattern: "lat(+DM),lon(+DM)"}),
        labelStyle: {
            fill: "rgb(220,220,220)",
            font: "12px sans-serif",
            halo: "rgb(102,102,102)",
            haloWidth: 3
        },
        lineStyle: {
            color: "rgba(148,193,205,0.5)",
            width: 1
        },
        originLabelFormat: new LonLatPointFormat({pattern: "lat(+D),lon(+D)"}),
        originLabelStyle: {
            fill: "rgba(210,210,210,0.8)",
            font: "12px sans-serif",
            halo: "rgb(74,97,103, 0.8)",
            haloWidth: 3
        },
        originLineStyle: {
            color: "rgba(148,193,205,0.5)",
            width: 2
        }
    }
};

class ModelFactory {

    public createGridModel(modelOptions: any) {
        return new Promise<LonLatGrid>((resolve, reject) => {
            modelOptions =  modelOptions ? modelOptions : {};
            modelOptions.settings = modelOptions.settings ? modelOptions.settings : DefaultGridSettings.settings;
            modelOptions.options = modelOptions.options ? modelOptions.options : DefaultGridSettings.options;
            modelOptions.fallbackStyle = modelOptions.fallbackStyle ? modelOptions.fallbackStyle : DefaultGridSettings.fallbackStyle;
            const model = new LonLatGrid(modelOptions.settings, modelOptions.options);
            if (model) {
                model.fallbackStyle = modelOptions.fallbackStyle;
                resolve(model);
            } else {
                reject();
            }
        });
    }

    public createOpenApiTilesModel(modelOptions: any) {
        return new Promise<OgcOpenApiTilesModel>((resolve, reject) => {
            const model = new OgcOpenApiTilesModel({
                baseURL: modelOptions.baseURL,
                tileMatrix: modelOptions.tileMatrix,
                collection: modelOptions.collection,
                transparent:modelOptions.transparent,
                bgcolor:modelOptions.bgcolor,
            });
            if (model) {
                resolve(model);
            } else {
                reject();
            }
        });
    }

    public createOpenApiFeaturesModel(modelOptions: any) {
        return new Promise<FeatureModel>((resolve, reject) => {
            const referenceName = OgcOpenApiCrsTools.getReferenceName(modelOptions.tmp_reference)
            const reference = getReference(referenceName);

            const codec = new GeoJsonCodec({generateIDs: false, swapAxes: modelOptions.swapAxes ? [referenceName]: [] });
            const options: OgcOpenApiFeatureStoreConstructorOptions = {
                codec,
                outputFormat: modelOptions.outputFormat,
                reference,
                featureUrl: modelOptions.featureUrl,
                dataUrl: modelOptions.dataUrl,
                requestHeaders: modelOptions.requestHeaders,
                customCrs: modelOptions.customCrs,
                useCrs84Bounds: modelOptions.useCrs84Bounds
            }
                const store = new OgcOpenApiFeatureStore(options);
                const model = new FeatureModel(store, {reference: options.reference});
                if (model) {
                    resolve(model);
                } else {
                    reject();
                }

        });
    }

    public createOpenApiMapsModel(modelOptions: any) {
        return new Promise<OgcOpenApiMapsModel>((resolve, reject) => {
            const model = new OgcOpenApiMapsModel({
                baseURL: modelOptions.baseURL,
                collection: modelOptions.collection,
                crs: modelOptions.crs,
                transparent:modelOptions.transparent,
                bgcolor:modelOptions.bgcolor,
                datetime: modelOptions.datetime,
                subset: modelOptions.subset
            });
            if (model) {
                resolve(model);
            } else {
                reject();
            }
        });
    }

    public createTMSModel(modelOptions: any) {
        return new Promise<UrlTileSetModel>((resolve, reject) => {
            const REF_WEBMERCATOR = getReference("EPSG:3857");
            const bounds = createBounds(REF_WEBMERCATOR, [-20037508.34278924, 40075016.68557848, -20037508.352, 40075016.704]);

            const reference = REF_WEBMERCATOR;
            const model = new UrlTileSetModel({
                    baseURL: modelOptions.baseURL,
                    bounds,
                    reference,
                    subdomains: modelOptions.subdomains,
                    levelCount: modelOptions.levelCount
                }
            );
            if (model) {
                resolve(model);
            } else {
                reject();
            }
        });
    }



}

export {
    ModelFactory
}