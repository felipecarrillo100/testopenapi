import React, {ForwardedRef, forwardRef, useImperativeHandle, useRef, useState} from "react";
import {SlidePanel, SliderPanelRef} from "./SlidePanel";
import "./SlidePanels.scss";
import {Command} from "../../commands/Command";

export interface SliderPanelContentProps {
    closeForm?: ()=>void;
    handleCommand?: (command: Command)=>void;
}

export interface SliderContentRef {
    canClose: () => boolean;
    handleCommand?: (command: Command)=>void;
}

export interface SliderPanelsRef {
    addFormLeft: (content: React.ReactNode)=>void;
    addFormRight: (content: React.ReactNode)=>void;
}

interface Props {
    handleCommand?: (command: Command)=>void;
}

const SliderPanels = forwardRef((props: Props, ref:ForwardedRef<SliderPanelsRef>) =>{
    const [sliderPanelLeft, setSliderPanelLeft] = useState([] as JSX.Element[])
    const [sliderPanelRight, setSliderPanelRight] = useState([] as JSX.Element[])

    const panelLeftRef = useRef(null as (SliderPanelRef | null) )
    const panelRightRef = useRef(null as (SliderPanelRef | null) )

    const closeSliderLeft = () => {
        setSliderPanelLeft([]);
        panelLeftRef.current = null;
    }

    const closeSliderRight = () => {
        setSliderPanelRight([]);
        panelRightRef.current = null;
    }

    const handleCommand = (command: Command) => {
        if (typeof props.handleCommand === "function") {
            props.handleCommand(command)
        }
    }

    const addFormLeft = (content: React.ReactNode) => {
        const addPanelL = () => {
            const slider = <SlidePanel onClose={closeSliderLeft} handleCommand={handleCommand} ref={panelLeftRef} key={1}>
                {content}
            </SlidePanel>;
            setSliderPanelLeft([slider])
        }
        if (sliderPanelLeft.length===0 && panelLeftRef.current === null) {
            addPanelL()
        } else {
            if (panelLeftRef.current && panelLeftRef.current.closeForm()) {
                setTimeout(()=>{
                    addPanelL();
                },100)
            }
        }
    }

    const addFormRight = (content: React.ReactNode) => {
        const addPanelR = () => {
            const slider = <SlidePanel onClose={closeSliderRight} handleCommand={handleCommand} ref={panelRightRef} alignRight={true} key={1}>
                {content}
            </SlidePanel>;
            setSliderPanelRight([slider])
        }
        if (sliderPanelRight.length===0 && panelRightRef.current === null) {
            addPanelR();
        } else {
            if (panelRightRef.current && panelRightRef.current.closeForm()) {
                setTimeout(()=>{
                    addPanelR();
                },100)
            }
        }
    }

    useImperativeHandle(ref, () => ({ addFormLeft: addFormLeft, addFormRight: addFormRight }), [ addFormLeft, addFormRight ])

    return (
        <div className="SliderPanels">
            {sliderPanelLeft}
            {sliderPanelRight}
        </div>
    )
})

export{
    SliderPanels
}