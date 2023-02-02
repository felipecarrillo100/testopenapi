import React, {ForwardedRef, forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import { X } from 'react-bootstrap-icons';
import {isForwardRef} from "react-is";
import {SliderContentRef, SliderPanelContentProps} from "./SliderPanels";
import {Command} from "../../commands/Command";

interface Props {
    onClose?: ()=>void;
    children?: React.ReactNode;
    alignRight?: boolean;
    handleCommand: (command: Command)=>void;
}

export interface SliderPanelRef {
    closeForm: () => boolean;
}

const SlidePanel = forwardRef((props: Props, ref:ForwardedRef<SliderPanelRef>) =>{
    const [visible, setVisible] = useState(false);
    const formRef = useRef(null as SliderContentRef | null);

    useEffect(()=>{
        setVisible(true);
    }, [])

    const onClickClose = () => {
        const closeAction = () => {
            setVisible(false);
            setTimeout(()=>{
                if ( typeof props.onClose === "function") props.onClose();
            }, 50) ;
        }
        if (formRef.current && typeof formRef.current.canClose === "function" ){
            if (formRef.current.canClose()) {
                closeAction();
            } else {
                return false;
            }
        } else {
            closeAction();
        }
        return true;
    }

    const handleCommand = (command: Command) => {
        if (typeof props.handleCommand === "function") props.handleCommand(command);
    }

    useImperativeHandle(ref, () => ({ closeForm: onClickClose }), [ onClickClose ])

    const childrenWithProps = React.Children.map(props.children, child => {
        // Checking isValidElement is the safe way and avoids a typescript error too.
        if (React.isValidElement(child)) {
            if (isForwardRef(child)) {
                // @ts-ignore
                return React.cloneElement(child, { ref:formRef, closeForm: onClickClose, handleCommand});
            }
            else {
                // @ts-ignore
                return React.cloneElement(child, {  closeForm: onClickClose, handleCommand});
            }
        }
        return child;
    });

    return (
        <div className={"SlidePanel" + (props.alignRight ? " right" : " left" ) + (visible ? "" : " hidden")}>
            <div className="header-holder">
                <div className="header">
                    Connect
                </div>
                <div className="controls">
                    <button className="control-button" onClick={onClickClose}><X/></button>
                </div>
            </div>
            <div className="body-holder">
                {childrenWithProps}
            </div>
        </div>
    )
});

export {
    SlidePanel
}