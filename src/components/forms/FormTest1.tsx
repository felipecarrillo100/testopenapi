import React, {ForwardedRef, forwardRef, useImperativeHandle, useState} from "react";
import {Button, Container, Form} from "react-bootstrap"
import {SliderContentRef, SliderPanelContentProps} from "../SliderPanels/SliderPanels";




const FormTest1 = forwardRef((props: SliderPanelContentProps, ref:ForwardedRef<SliderContentRef>) =>{
    const [ready, setReady] = useState(false);
    const canClose = () => {
        return ready;
    }

    useImperativeHandle(ref, () => ({ canClose }), [ canClose ])

    return (
        <Form >
            <Container>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control type="email" placeholder="Enter email" />
                    <Form.Text className="text-muted">
                        We'll never share your email with anyone else.
                    </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicCheckbox">
                    <Form.Check type="checkbox" label="Ready" checked={ready} onChange={()=>setReady(!ready)} />
                </Form.Group>
                <Button variant="primary" type="button" onClick={props.closeForm}>
                    Cancel
                </Button>
                <Button variant="info" type="button" onClick={props.closeForm}>
                    Submit
                </Button>
            </Container>
        </Form>
    )
})

export{
    FormTest1
}