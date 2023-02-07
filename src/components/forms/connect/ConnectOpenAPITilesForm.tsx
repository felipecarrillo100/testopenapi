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
        tileMatrices: [] as TileSetData[],
        tileMatrixID: "",
        collection: "",
        tileMatrix: null as (null | TileSetData),
        formats: [] as LinkType[],
        format: "" as string,
        baseUrl: "" as string,
        transparent: true,
        bgcolor: "0xFFFFFF"
    })

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;
        const realValue = event.target.type === 'checkbox' ? event.target.checked : value;
        setInputs({...inputs, [name]: realValue});
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
            const tileMatrix = foundTileMatrix;
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
        }
    }

    const submit = (event: React.SyntheticEvent) => {
        event.preventDefault();
        event.stopPropagation();
        console.log("Submit!");

        const collection = inputs.collections.find(c=>c.id===inputs.collection);

        if (collection && inputs.tileMatrix) {
            if (OgcOpenApiGetCapabilities.getQuadTreeCompatibleLevelOffset(inputs.tileMatrix) !== 0) {
                console.log("Tile Matrix not supported!!!!")
                return;
            }
                    const command: Command = {
                        type: CommandType.CreateAnyLayer,
                        parameters: {
                            layerType: LayerTypes.OpenApiTiles,
                            model:{
                                baseURL: inputs.baseUrl,
                                collection: collection.id,
                                tileMatrix: inputs.tileMatrix,
                                bgcolor: inputs.bgcolor,
                                transparent: inputs.transparent
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

    const setCurrentCapabilities = ( c: OgcOpenApiCapabilitiesObject | null) => {
        capabilities.current = c;
    }

    const loadTileMatrices = ():Promise<TileSetData[]> => {
        return new Promise<TileSetData[]>(resolve => {
            OgcOpenApiGetCapabilities.fetchTileSetsInFull(capabilities.current).then(arr=>{
                resolve(arr.filter(a=>OgcOpenApiGetCapabilities.getQuadTreeCompatibleLevelOffset(a)==0))
            })
        })
    }

    const loadAvailableFormats = (collection: OgcOpenApiCapabilitiesCollection, tileMatrixID: string) => {
        return new Promise<{format: string, baseUrl: string, formats:LinkType[]}>((resolve, reject)=>{
            if (collection && capabilities.current) {
                OgcOpenApiGetCapabilities.getTilesLink(capabilities.current, collection, tileMatrixID).then((availableFormats)=>{
                    let format = PREFERRED_IMAGE_FORMAT;
                    let baseUrl = "";
                    if (availableFormats.length>0) {
                        const formatLink = availableFormats.find(l=>l.type === PREFERRED_IMAGE_FORMAT);
                        if (!formatLink) {
                            format = availableFormats[0].type;
                            baseUrl = availableFormats[0].href;
                        } else {
                            format = formatLink.type;
                            baseUrl = formatLink.href;
                        }
                    }
                    resolve({
                        format: format,
                        baseUrl: baseUrl,
                        formats: availableFormats
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
                    const tileMatrix = tilesetMeta[0]
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
                        <option value={t.type} key={t.type+`_${index}`}>{t.type}</option>
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

            <Row>
                <Col sm={6}>
                    <Form.Group className="mb-3" controlId="transparent-id">
                        <Form.Check label="Transparent" name={"transparent"} checked={inputs.transparent} onChange={handleChange} />
                    </Form.Group>
                </Col>
                <Col sm={6}>
                    <Form.Group className="mb-3" controlId="backgroundColorID">
                        <Form.Label>BG Color</Form.Label>
                        <Form.Control placeholder="Color i.e 0xFFFFFF" name="bgcolor" value={inputs.bgcolor} onChange={handleChange}/>
                    </Form.Group>
                </Col>
            </Row>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                <Form.Label>Tile Matrix</Form.Label>
                <Form.Control as="textarea" rows={5} value={JSON.stringify(inputs.tileMatrix, null, 2)} readOnly={true} onChange={handleChange}/>
            </Form.Group>

            <div style={{ display: "inline-block", width: "100%"}}>
                <div style={{float:"right"}}>
                    <Button variant="secondary" type="button" onClick={props.closeForm}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" >
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