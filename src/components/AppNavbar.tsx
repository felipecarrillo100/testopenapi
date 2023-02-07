import React from "react";
import {Container, Nav, Navbar, NavDropdown} from "react-bootstrap";
import {Command, CommandType} from "../commands/Command";
import {LayerTypes} from "../commands/LayerTypes";

interface Props {
    handleCommand: (command: Command)=>void;
}

const AppNavbar: React.FC<Props> = (props: Props) => {
    const triggerCommand = (commandType: CommandType) => () => {
        props.handleCommand({
            type: commandType
        })
    }

    const triggerCommandCreateAnyLayer = (layerType: LayerTypes) => () => {
        props.handleCommand({
            type: CommandType.CreateAnyLayer,
            parameters: {
                layerType: layerType
            }
        })
    }

    const triggerCommandOpenFormByID = (formId: string) => () => {
        props.handleCommand({
            type: CommandType.CreateForm,
            parameters: {
                formId: formId
            }
        })
    }

    return (
        <Navbar bg="light" expand="lg">
            <Container>
                <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <NavDropdown title="Connect" id="basic-nav-dropdown">
                            <NavDropdown.Item onClick={triggerCommandCreateAnyLayer(LayerTypes.GRID)}>
                                Grid
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={triggerCommandOpenFormByID("ConnectTMS")}>
                                TMS
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={triggerCommandOpenFormByID("ConnectOpenAPITiles")}>
                                Open API Tiles
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={triggerCommandOpenFormByID("ConnectOpenAPIMaps")}>
                                Open API Maps
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={triggerCommandOpenFormByID("ConnectOpenAPIFeatures")}>
                                Open API Features
                            </NavDropdown.Item>
                        </NavDropdown>

                        <NavDropdown title="Test" id="basic-nav-dropdown">
                            <NavDropdown.Item onClick={triggerCommandCreateAnyLayer(LayerTypes.GRID)}>
                                Grid
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export {
    AppNavbar
}