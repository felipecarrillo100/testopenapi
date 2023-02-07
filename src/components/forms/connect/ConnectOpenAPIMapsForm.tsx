import React, {useRef, useState} from "react";
import {SliderPanelContentProps} from "../../SliderPanels/SliderPanels";
import {Button, Col, Form, Row} from "react-bootstrap";
import {Command, CommandType} from "../../../commands/Command";
import {LayerTypes} from "../../../commands/LayerTypes";
import {
    CollectionLinkType,
    LinkType,
    OgcOpenApiCapabilitiesCollection,
    OgcOpenApiCapabilitiesObject,
    OgcOpenApiGetCapabilities
} from "ogcopenapis/lib/OgcOpenApiGetCapabilities";

const PREFERRED_IMAGE_FORMAT = "image/png";

const ConnectOpenAPIMapsForm: React.FC<SliderPanelContentProps> = (props: SliderPanelContentProps) =>{
    const capabilities = useRef(null as (null |  OgcOpenApiCapabilitiesObject))

    const [inputs , setInputs] = useState({
        label: "OGC API Maps Layer",
        url: "https://maps.gnosis.earth/ogcapi/",
        // url: "https://test.cubewerx.com/cubewerx/cubeserv/demo/ogcapi/EuroRegionalMap",
        collections: [] as OgcOpenApiCapabilitiesCollection[],
        collection: "",
        crs: "",
        formats: [] as LinkType[],
        format: "" as string,
        baseUrl: "" as string,
        projections: [] as string[],
        transparent: true,
        bgcolor: "0xFFFFFF"
    })

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;
        const realValue = event.target.type === 'checkbox' ? event.target.checked : value;
        setInputs({...inputs, [name]: realValue});
    }

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const {name, value} = event.target;
        setInputs({...inputs, [name]: value});
    }


    const handleSelectLayer = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const {name, value} = event.target;
        const collection = inputs.collections.find(c=>c.id === value);
        if (collection && capabilities.current) {
            const availableFormats = OgcOpenApiGetCapabilities.filterCollectionLinks(collection.links, CollectionLinkType.Map);
            const formatLink = availableFormats.find(l=>l.type === PREFERRED_IMAGE_FORMAT);
            const format = formatLink ? formatLink.type : availableFormats[0].type;
            const baseUrl = formatLink ? formatLink.href : availableFormats[0].href;
            setInputs({...inputs,
                collection: collection.id,
                crs: collection.crs[0],
                projections: collection.crs,
                formats: availableFormats, format,
                baseUrl: capabilities.current?.serverOptions.complete(baseUrl)
            })
        }
    }

    const handleSelectFormat  = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const {name, value} = event.target;
        const collection = inputs.collections.find(c=>c.id === inputs.collection);
        if (collection && capabilities.current) {
            const availableFormats = OgcOpenApiGetCapabilities.filterCollectionLinks(collection.links, CollectionLinkType.Map);
            const formatLink = availableFormats.find(l=>l.type === value);
            const baseUrl = formatLink ? formatLink.href : availableFormats[0].href;
            setInputs({
                ...inputs,
                [name]: value,
                baseUrl: capabilities.current.serverOptions.complete(baseUrl)
            });
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
                            layerType: LayerTypes.OpenApiMaps,
                            model:{
                                baseURL: inputs.baseUrl,
                                collection: collection.id,
                                crs: inputs.crs,
                                transparent: inputs.transparent,
                                bgcolor: inputs.bgcolor,
                                subset: ["sub1", "sub2"],
                                datetime: "2018-02-12T23:20:50Z"
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

    const setCapabilities = (c:any) => capabilities.current = c;

    const getCapabilities = () => {
        setCapabilities(null);
        OgcOpenApiGetCapabilities.fromURL(inputs.url,{filterCollectionsByLinkType: CollectionLinkType.Map}).then(capabilities=>{
            setCapabilities(capabilities);
            const firstCollection = capabilities.collections[0];
            const availableFormats = OgcOpenApiGetCapabilities.filterCollectionLinks(firstCollection.links, CollectionLinkType.Map);
            const formatLink = availableFormats.find(l=>l.type === PREFERRED_IMAGE_FORMAT);
            const format = formatLink ? formatLink.type : availableFormats[0].type;
            const baseUrl = formatLink ? formatLink.href : availableFormats[0].href;
            setInputs({...inputs,
                collections: capabilities.collections, collection: firstCollection.id,
                crs: firstCollection.crs[0],
                formats: availableFormats, format,
                baseUrl: capabilities.serverOptions.complete(baseUrl),
                projections: firstCollection.crs,
            })
        }, (err)=>{
            console.log("Error retrieving capabilities");
            })
    }

    let currentCollection = inputs.collections.find(c=>c.id===inputs.collection);
    currentCollection = currentCollection ? currentCollection : {} as any;

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


            <Form.Group className="mb-3" controlId="formats-id">
                <Form.Label>Available Formats</Form.Label>
                <Form.Select name="format" value={inputs.format} onChange={handleSelectFormat}>
                    {inputs.formats.map((t, index)=> (
                        <option value={t.type} key={t.type+index}>{t.type}</option>
                    ))}
                </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formats-id">
                <Form.Label>Available Projections</Form.Label>
                <Form.Select name="crs" value={inputs.crs} onChange={handleSelectChange}>
                    {inputs.projections.map((t, index)=> (
                        <option value={t} key={t+index}>{t}</option>
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
    ConnectOpenAPIMapsForm
}