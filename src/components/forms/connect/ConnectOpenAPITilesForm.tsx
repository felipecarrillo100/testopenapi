import React, {useRef, useState} from "react";
import {SliderPanelContentProps} from "../../SliderPanels/SliderPanels";
import {Button, Col, Form, Row} from "react-bootstrap";
import {Command, CommandType} from "../../../commands/Command";
import {LayerTypes} from "../../../commands/LayerTypes";
import {
    CollectionLinkType, LinkType,
    OgcOpenApiCapabilitiesCollection, OgcOpenApiCapabilitiesObject,
    OgcOpenApiGetCapabilities, TileSetData, TileSetMeta
} from "ogcopenapis/lib/OgcOpenApiGetCapabilities";

const PREFERRED_IMAGE_FORMAT = "image/png";

const ConnectOpenAPITilesForm: React.FC<SliderPanelContentProps> = (props: SliderPanelContentProps) =>{
    const capabilities = useRef(null as (null |  OgcOpenApiCapabilitiesObject))

    const [inputs , setInputs] = useState({
        label: "OGC API Tiles Layer",
        url: "https://maps.gnosis.earth/ogcapi/",
        // url: "https://test.cubewerx.com/cubewerx/cubeserv/demo/ogcapi/EuroRegionalMap",
        collections: [] as OgcOpenApiCapabilitiesCollection[],
        tileMatrices: [] as TileSetMeta[],
        tileMatrixID: "",
        collection: "",
        tileMatrix: null as (null | TileSetData),
        formats: [] as LinkType[],
        format: "" as string,
        baseUrl: "" as string
    })

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;
        setInputs({...inputs, [name]: value});
    }

    const handleSelectFormat = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const {name, value} = event.target;
        const format = inputs.formats.find(f=>f.type === value);
        if (inputs.formats.length>0) {
            if (format) {
                setInputs({
                    ...inputs,
                    format: value,
                    baseUrl: format.href
                });
            } else {
                setInputs({
                    ...inputs,
                    format: inputs.formats[0].type,
                    baseUrl: inputs.formats[0].href
                });
            }
        }
    }

    const handleSelectLayer = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const {name, value} = event.target;
        const collection = inputs.collections.find(c=>c.id === value);
        const tileMatrix = inputs.tileMatrices.find(t=>t.id === inputs.tileMatrixID);
        if (collection && tileMatrix) {
            loadAvailableFormats(collection, tileMatrix.id).then((formatsResult)=>{
                setInputs({...inputs,
                    [name]: value,
                    format: formatsResult.format,
                    formats: formatsResult.formats,
                    baseUrl: formatsResult.baseUrl
                });
            })
        }
    }

    const handleSelectTileMatrix = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const {name, value} = event.target;
        const collection = inputs.collections.find(c=>c.id === inputs.collection);
        const foundTileMatrix = inputs.tileMatrices.find(t=>t.id === value);
        if (collection && foundTileMatrix) {
            loadTileMatrix(foundTileMatrix).then((tileMatrix)=> {
                loadAvailableFormats(collection, tileMatrix.id).then((formatsResult) => {
                    setInputs({
                        ...inputs,
                        [name]: value,
                        tileMatrix,
                        format: formatsResult.format,
                        formats: formatsResult.formats,
                        baseUrl: formatsResult.baseUrl
                    });
                })
            })
        }
    }

    const submit = (event: React.SyntheticEvent) => {
        event.preventDefault();
        event.stopPropagation();
        console.log("Submit!");

        const collection = inputs.collections.find(c=>c.id===inputs.collection);
        if (collection) {
                    const command: Command = {
                        type: CommandType.CreateAnyLayer,
                        parameters: {
                            layerType: LayerTypes.OpenApiTiles,
                            model:{
                                baseURL: inputs.baseUrl,
                                collection: collection.id,
                                tileMatrix: inputs.tileMatrix
                            },
                            layer:{
                                label: inputs.label
                            }
                        }
                    }
                    if (typeof props.handleCommand === "function") props.handleCommand(command);
                    if (typeof props.closeForm === "function") props.closeForm();
        }
    }

    const loadTileMatrix = ( tileSetMeta: TileSetMeta ) => {
        return new Promise<TileSetData>((resolve)=>{
            if (capabilities.current) {
                OgcOpenApiGetCapabilities.fetchTileset(capabilities.current, tileSetMeta).then(tileMatrix=>{
                    resolve(tileMatrix);
                }).catch(()=>{
                    console.log("Failed to load tilematrix")
                })
            }
        })
    }

    const setCurrentCapabilities = ( c: OgcOpenApiCapabilitiesObject | null) => {
        capabilities.current = c;
    }

    const loadTileMatrices = () => {
         return OgcOpenApiGetCapabilities.fetchTileSets(capabilities.current);
    }

    const loadAvailableFormats = (collection: OgcOpenApiCapabilitiesCollection, tileMatrixID: string) => {
        return new Promise<{format: string, baseUrl: string, formats:LinkType[]}>((resolve, reject)=>{
            if (collection && capabilities.current) {
                OgcOpenApiGetCapabilities.getTilesLink(capabilities.current, collection, tileMatrixID).then((availaleFormats)=>{
                    let format = PREFERRED_IMAGE_FORMAT;
                    let baseUrl = "";
                    if (availaleFormats.length>0) {
                        const formatLink = availaleFormats.find(l=>l.type === PREFERRED_IMAGE_FORMAT);
                        if (!formatLink) {
                            format = availaleFormats[0].type;
                            baseUrl = availaleFormats[0].href;
                        } else {
                            format = formatLink.type;
                            baseUrl = formatLink.href;
                        }
                    }
                    resolve({
                        format: format,
                        baseUrl: baseUrl,
                        formats: availaleFormats
                    })
                });
            } else {
                reject();
            }
        });
    }

    const getCapabilities = () => {
        setCurrentCapabilities(null);
        OgcOpenApiGetCapabilities.fromURL(inputs.url,{filterCollectionsByLinkType: CollectionLinkType.Tiles}).then(capabilities=>{
            setCurrentCapabilities(capabilities);
            loadTileMatrices().then((tilesetMeta)=>{
                if (capabilities.collections.length>0 && tilesetMeta.length>0) {
                    const firstCollection = capabilities.collections[0];
                    const firstTileMatrix = tilesetMeta[0];
                    loadTileMatrix(firstTileMatrix).then((tileMatrix)=>{
                        loadAvailableFormats(firstCollection, firstTileMatrix.id).then((formatsResult)=>{
                            setInputs({...inputs,
                                collections: capabilities.collections,
                                tileMatrices: tilesetMeta,
                                tileMatrixID: tilesetMeta[0].id,
                                tileMatrix,
                                collection:
                                firstCollection.id,
                                format: formatsResult.format,
                                formats: formatsResult.formats,
                                baseUrl: formatsResult.baseUrl
                            });
                        })
                    });
                }
            });
        }, (err)=>{
            console.log("Error retrieving capabilities");
            })
    }

    return (
        <Form onSubmit={submit}>
            <Form.Group className="mb-3" controlId="labelID">
                <Form.Label>Label</Form.Label>
                <Form.Control placeholder="Layer name" name="label" value={inputs.label} onChange={handleChange}/>
            </Form.Group>

            <Form.Group className="mb-3" controlId="urlID">
                <Form.Label>URL</Form.Label>
                <Form.Control placeholder="Layer name" name="url" value={inputs.url} onChange={handleChange}/>
            </Form.Group>

            <div style={{ display: "inline-block", width: "100%"}}>
                <div style={{float:"right"}}>
                    <Button variant="secondary" type="button" onClick={getCapabilities}>
                        Get layers
                    </Button>
                </div>
            </div>

            <Form.Group className="mb-3" controlId="collections-id">
                <Form.Label>Layers</Form.Label>
                <Form.Select name="collection" value={inputs.collection} onChange={handleSelectLayer}>
                    {inputs.collections.map((c, index)=> (
                        <option value={c.id} key={c.id+index}>{c.name}</option>
                    ))}
                </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="tilematrices-id">
                <Form.Label>Tile Matrices</Form.Label>
                <Form.Select name="tileMatrixID" value={inputs.tileMatrixID} onChange={handleSelectTileMatrix}>
                    {inputs.tileMatrices.map((t, index)=> (
                        <option value={t.id} key={t.id+index}>{t.title?t.title:t.id}</option>
                    ))}
                </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formats-id">
                <Form.Label>Available Formats</Form.Label>
                <Form.Select name="format" value={inputs.format} onChange={handleSelectFormat}>
                    {inputs.formats.map((t, index)=> (
                        <option value={t.type} key={t.type}>{t.type}</option>
                    ))}
                </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formatID">
                <Form.Label>FORMAT !!!</Form.Label>
                <Form.Control placeholder="Layer name" name="format" defaultValue={inputs.format} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formatID">
                <Form.Label>baseUrl !!!</Form.Label>
                <Form.Control placeholder="Layer name" name="baseUrl" defaultValue={inputs.baseUrl} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                <Form.Label>Tile Matrix</Form.Label>
                <Form.Control as="textarea" rows={5} value={JSON.stringify(inputs.tileMatrix, null, 2)} readOnly={true} onChange={handleChange}/>
            </Form.Group>

            <div style={{ display: "inline-block", width: "100%"}}>
                <div style={{float:"right"}}>
                    <Button variant="secondary" type="button" onClick={props.closeForm}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" onClick={props.closeForm}>
                        Create Layer
                    </Button>
                </div>
            </div>
        </Form>
    )
}

export{
    ConnectOpenAPITilesForm
}