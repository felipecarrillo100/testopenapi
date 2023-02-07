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

const PREFERRED_FEATURE_FORMAT = "application/geo+json";
const PREFERRED_CRS = "http://www.opengis.net/def/crs/OGC/1.3/CRS84";

const ConnectOpenAPIFeaturesForm: React.FC<SliderPanelContentProps> = (props: SliderPanelContentProps) =>{
    const capabilities = useRef(null as (null |  OgcOpenApiCapabilitiesObject))

    const [inputs , setInputs] = useState({
        label: "OGC API Features Layer",
        url: "https://maps.gnosis.earth/ogcapi/",
        // url: "https://test.cubewerx.com/cubewerx/cubeserv/demo/ogcapi/EuroRegionalMap",
        collections: [] as OgcOpenApiCapabilitiesCollection[],
        collection: "",
        crs: "",
        formats: [] as LinkType[],
        format: "" as string,
        baseUrl: "" as string,
        projections: [] as string[],
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
            const availableFormats = OgcOpenApiGetCapabilities.filterCollectionLinks(collection.links, CollectionLinkType.Items);
            const formatLink = availableFormats.find(l=>l.type === PREFERRED_FEATURE_FORMAT);
            const format = formatLink ? formatLink.type : availableFormats[0].type;
            const baseUrl = formatLink ? formatLink.href : availableFormats[0].href;
            setInputs({...inputs,
                collection: collection.id,
                crs: PREFERRED_CRS,
                projections: collection.crs,
                formats: availableFormats, format,
                baseUrl: baseUrl
            })
        }
    }

    const handleSelectFormat  = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const {name, value} = event.target;
        const collection = inputs.collections.find(c=>c.id === inputs.collection);
        if (collection && capabilities.current) {
            const availableFormats = OgcOpenApiGetCapabilities.filterCollectionLinks(collection.links, CollectionLinkType.Items);
            const formatLink = availableFormats.find(l=>l.type === value);
            const baseUrl = formatLink ? formatLink.href : availableFormats[0].href;
            setInputs({
                ...inputs,
                [name]: value,
                baseUrl: baseUrl
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
                            layerType: LayerTypes.OpenApiFeatures,
                            model:{
                                outputFormat: inputs.format,
                                tmp_reference: inputs.crs,
                                featureUrl: inputs.baseUrl,
                                dataUrl: inputs.baseUrl,
                                requestHeaders: {},
                                customCrs: inputs.crs,
                                useCrs84Bounds: true
                            },
                            layer:{
                                label: inputs.label,
                                selectable: true
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
        OgcOpenApiGetCapabilities.fromURL(inputs.url,{filterCollectionsByLinkType: CollectionLinkType.Items}).then(capabilities=>{
            setCapabilities(capabilities);
            const firstCollection = capabilities.collections[0];
            const availableFormats = OgcOpenApiGetCapabilities.filterCollectionLinks(firstCollection.links, CollectionLinkType.Items);

            const formatLink = availableFormats.find(l=>l.type === PREFERRED_FEATURE_FORMAT);
            const format = formatLink ? formatLink.type : availableFormats[0].type;
            const baseUrl = formatLink ? formatLink.href : availableFormats[0].href;
            setInputs({...inputs,
                collections: capabilities.collections, collection: firstCollection.id,
                crs: PREFERRED_CRS,
                formats: availableFormats, format,
                projections: firstCollection.crs,
                baseUrl: baseUrl,
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
    ConnectOpenAPIFeaturesForm
}