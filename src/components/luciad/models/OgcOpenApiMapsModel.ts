import {WMSTileSetModel, WMSTileSetModelConstructorOptions} from "@luciad/ria/model/tileset/WMSTileSetModel";
import {TileCoordinate} from "@luciad/ria/model/tileset/TileCoordinate";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";
import {RasterDataType} from "@luciad/ria/model/tileset/RasterDataType";
import {RasterSamplingMode} from "@luciad/ria/model/tileset/RasterSamplingMode";
import {OgcOpenApiCrsTools} from "ogcopenapis/lib/OgcOpenApiCrsTools";
import {createTransformation} from "@luciad/ria/transformation/TransformationFactory";
import {CoordinateReference} from "@luciad/ria/reference/CoordinateReference";
import {Transformation} from "@luciad/ria/transformation/Transformation";
import {createPoint} from "@luciad/ria/shape/ShapeFactory";

interface OgcOpenApiMapsModelConstructorOptions {
    crs: string;
    baseURL: string;
    collection: string;
    dataType?: RasterDataType;
    samplingMode?: RasterSamplingMode;
    requestHeaders?: { [p: string]: string };
    format?: string;
    reverseAxis?: boolean;
    // To be implemented
    datetime?: string;
    subset?: string[];
    transparent?: boolean;
    bgcolor?: string;
}

class OgcOpenApiMapsModel extends WMSTileSetModel {
    public static REVERSED_PPROJECTIONS = ["EPSG:4269", "EPSG:4326", "EPSG:4267"];

    private format: string | undefined;
    private crs84: CoordinateReference;
    private transformer: Transformation;
    private crs: string;
    private reverseAxis: boolean | undefined;

    constructor(o: OgcOpenApiMapsModelConstructorOptions) {
        const referenceName = OgcOpenApiCrsTools.getReferenceName(o.crs)
        const reference = getReference(referenceName);
        super({
            reference,
            getMapRoot: o.baseURL,
            layers: [o.collection],
            dataType: o.dataType,
            samplingMode: o.samplingMode,
            requestHeaders: o.requestHeaders
        });
        this.crs = o.crs;
        this.format = o.format;
        this.crs84 = getReference("EPSG:4326")
        this.transformer = createTransformation(reference, this.crs84);
        this.reverseAxis = o.reverseAxis;
        this.modelDescriptor = {
            source: o.baseURL,
            name: o.collection,
            description: "OGC Open API Maps",
            type: super.dataType
        };
    }

    public static isReversedProjection(projection:string) {
        return OgcOpenApiMapsModel.REVERSED_PPROJECTIONS.includes(projection)
    }

    private transformPoint(coordinates: number[]) {
        const p = this.transformer.transform(createPoint(this.reference, coordinates));
        return [p.x, p.y]
    }

    public swapAxes(match: any, x1: any, y1:any, x2:any, y2:any) {
        return "BBOX=" + y1 + "," + x1 + "," + y2 + "," + x2;
    }

    getTileURL(baseURL: string, tile: TileCoordinate): string | null {
        let aURL = super.getTileURL(baseURL, tile);
        if (aURL) {
            const parts = aURL.split("?");
            const queryString = parts.length>1 ? parts[1] : "";
            const url = parts[0];
            const urlParams = new URLSearchParams(queryString);
            const bbox = urlParams.get('BBOX');
            const bboxStr = `[${bbox}]`;
            const bboxArray = JSON.parse(bboxStr);

            let p1 = this.transformPoint([bboxArray[0], bboxArray[1]]);
            let p2 = this.transformPoint([bboxArray[2], bboxArray[3]]);
            if (this.reverseAxis || OgcOpenApiMapsModel.isReversedProjection(this.reference.identifier)) {
                p1 = this.transformPoint([bboxArray[1], bboxArray[0]]);
                p2 = this.transformPoint([bboxArray[3], bboxArray[2]]);
            }
            let newBbox = `${p1[0]},${p1[1]},${p2[0]},${p2[1]}`;

            // let transformedUrl =  bbox ? url + `?bbox=${newBbox}&crs=${this.crs}` : url;
            let transformedUrl =  bbox ? url + `?bbox=${bbox}&crs=${this.crs}&bbox-crs=${this.crs}` : url;
            if (this.format) transformedUrl += "&f="+this.format;
            return transformedUrl;
        } else {
            return aURL
        }
    }

    getTileURL2(baseURL: string, tile: TileCoordinate): string | null {
        let aURL = super.getTileURL(baseURL, tile);
        if (aURL) {
            if (this.reverseAxis || OgcOpenApiMapsModel.isReversedProjection(this.reference.identifier)) {
                aURL = aURL.replace(/BBOX=([-\d\.]+),([-\d\.]+),([-\d\.]+),([-\d\.]+)/, this.swapAxes);
            }
            const parts = aURL.split("?");
            const queryString = parts.length>1 ? parts[1] : "";
            const url = parts[0];
            const urlParams = new URLSearchParams(queryString);
            const bbox = urlParams.get('BBOX');
            let transformedUrl =  bbox ? url + `?bbox=${bbox}&crs=${this.crs}` : url;
            if (this.format) transformedUrl += "&f="+this.format;
            return transformedUrl;
        } else {
            return aURL
        }
    }

}

export {
    OgcOpenApiMapsModel
}