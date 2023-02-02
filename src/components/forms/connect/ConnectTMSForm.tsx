import React, {useState} from "react";
import {SliderPanelContentProps} from "../../SliderPanels/SliderPanels";
import {Button, Form} from "react-bootstrap";
import {Command, CommandType} from "../../../commands/Command";
import {LayerTypes} from "../../../commands/LayerTypes";

const ConnectTMSForm: React.FC<SliderPanelContentProps> = (props: SliderPanelContentProps) =>{

    const [inputs , setInputs] = useState({
        label: "TMS Layer",
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{-y}.png",
        levels: 21,
        domains: "a,b,c",
    })

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;
        setInputs({...inputs, [name]: value});
    }

    const submit = (event: React.SyntheticEvent) => {
        event.preventDefault();
        event.stopPropagation();
        console.log("Submit!");

        const command: Command = {
            type: CommandType.CreateAnyLayer,
            parameters: {
                layerType: LayerTypes.TMS,
                model:{
                    baseURL : inputs.url,
                    levelCount: inputs.levels,
                    subdomains: inputs.domains.split(",")
                },
                layer:{
                    label: inputs.label
                }
            }
        }

        if (typeof props.handleCommand === "function") props.handleCommand(command);
        if (typeof props.closeForm === "function") props.closeForm();
    }

    return (
        <Form onSubmit={submit}>
            <Form.Group className="mb-3" controlId="label-ID">
                <Form.Label>Label</Form.Label>
                <Form.Control placeholder="Layer name" name="label" value={inputs.label} onChange={handleChange}/>
            </Form.Group>

            <Form.Group className="mb-3" controlId="url-ID">
                <Form.Label>URL</Form.Label>
                <Form.Control placeholder="URl pattern" name="url" value={inputs.url} onChange={handleChange}/>
            </Form.Group>

            <Form.Group className="mb-3" controlId="levels-ID">
                <Form.Label>Levels</Form.Label>
                <Form.Control placeholder="Zoom levels" type="number" name="levels" value={inputs.levels} onChange={handleChange}/>
            </Form.Group>

            <Form.Group className="mb-3" controlId="domains-ID">
                <Form.Label>Domains</Form.Label>
                <Form.Control placeholder="Domains" name="domains" value={inputs.domains} onChange={handleChange}/>
            </Form.Group>

            <div style={{float:"right"}}>
                <Button variant="secondary" type="button" onClick={props.closeForm}>
                    Cancel
                </Button>
                <Button variant="primary" type="submit" onClick={props.closeForm}>
                    Create Layer
                </Button>
            </div>
        </Form>
    )
}

export{
    ConnectTMSForm
}