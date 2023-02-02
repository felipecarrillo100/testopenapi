import {ModelFactory} from "./ModelFactory";
import {LayerFactory} from "./LayerFactory";
import {Command, CommandType} from "../../../commands/Command";
import {LayerTypes} from "../../../commands/LayerTypes";
import {RasterTileSetLayer} from "@luciad/ria/view/tileset/RasterTileSetLayer";
import {UrlTileSetModel} from "@luciad/ria/model/tileset/UrlTileSetModel";
import {Map} from "@luciad/ria/view/Map";
import {Layer} from "@luciad/ria/view/Layer";
import {LayerGroup} from "@luciad/ria/view/LayerGroup";
import {LayerTree} from "@luciad/ria/view/LayerTree";
import {LonLatGrid} from "@luciad/ria/view/grid/LonLatGrid";
import {GridLayer} from "@luciad/ria/view/grid/GridLayer";

import { OgcOpenApiTilesModel } from "../models/OgcOpenApiTilesModel";
import {OgcOpenApiMapsModel} from "../models/OgcOpenApiMapsModel";

function PromiseToModel<mytype>(model:any) {
    return new Promise<mytype>((resolve)=>resolve(model));
}

class LayerBuilder {
    private modelFactory: ModelFactory;
    private layerFactory: LayerFactory;
    private map: Map;

    constructor(map: Map) {
        this.modelFactory = this.createModelFactory();
        this.layerFactory = this.createLayerFactory()
        this.map = map;
    }

    protected createLayerFactory()  {
        return new LayerFactory();
    }

    protected createModelFactory()  {
        return new ModelFactory();
    }

    handleCommand(command: Command ) {
        switch (command.type) {
            case CommandType.CreateAnyLayer:
                this.createAnyLayer(command);
                break;
        }
    }

    protected createAnyLayer(command: Command) {
        let layerPromise = null;
        switch ((command as any).parameters.layerType as LayerTypes) {
            case LayerTypes.GRID:
                layerPromise = this.buildAnyLayer<LonLatGrid, GridLayer>(command, this.modelFactory.createGridModel, this.layerFactory.createGridLayer);
                break;
            case LayerTypes.TMS:
                layerPromise = this.buildAnyLayer<UrlTileSetModel, RasterTileSetLayer>(command, this.modelFactory.createTMSModel, this.layerFactory.createTMSLayer);
                break;
            case LayerTypes.WMS:
                console.log("Creating WMS")
                break;
            case LayerTypes.OpenApiTiles:
                console.log("Creating Open Api Tiles");
                layerPromise = this.buildAnyLayer<OgcOpenApiTilesModel, RasterTileSetLayer>(command, this.modelFactory.createOpenApiTilesModel, this.layerFactory.createOpenApiTilesLayer);
                break;
            case LayerTypes.OpenApiMaps:
                console.log("Creating Open Api Maps");
                layerPromise = this.buildAnyLayer<OgcOpenApiMapsModel, RasterTileSetLayer>(command, this.modelFactory.createOpenApiMapsModel, this.layerFactory.createOpenApiMapsLayer);
                break;
        }
        layerPromise?.then(layer=> {
            console.log(layer);
            this.createLayer(layer);
        })
    }


    private buildAnyLayer<M, L>(command: Command, createModel: (modelOptions: any) => Promise<M>, createLayer: (m: M, layerOptions: any) => Promise<L>) {
        return new Promise<L>((resolve => {
            const modelPromise = command.parameters.reusableModel ? PromiseToModel<M>(command.parameters.reusableModel) : createModel(command.parameters.model);
            modelPromise.then((model)=>{
                delete command.parameters.reusableModel;
                const layerPromise = createLayer(model, command.parameters.layer);
                layerPromise.then(layer=>{
                    resolve(layer);
                })
            })
        }))
    }

    private createLayer(layer: (Layer  | LayerGroup | LayerTree)) {
        if (this.map) {
            this.map.layerTree.addChild(layer);
        }
    }
}

export {
    LayerBuilder
}