import React, {useEffect, useRef} from "react";
import "./LuciadMap.scss"
import {WebGLMap} from "@luciad/ria/view/WebGLMap";
import {Map} from "@luciad/ria/view/Map";
import {LayerBuilder} from "./factories/LayerBuilder";
import {Command} from "../../commands/Command";

interface Props {
    command: Command | null;
    createLayerBuilder?: (map: Map)=>LayerBuilder;
}

const LuciadMap: React.FC<Props> = (props: Props)=>{
    const element = useRef(null as (null | HTMLDivElement));
    const map = useRef(null as (null | Map));
    const masterLayerBuilder = useRef(null as (null | LayerBuilder));

    const createLayerBuilder = (m: Map) => {
        if (typeof props.createLayerBuilder === "function") return props.createLayerBuilder(m);
        return new LayerBuilder(m);
    }

    useEffect(() => {
        console.log("Creating Map")
        if (element.current) {
            map.current= new WebGLMap(element.current);
            masterLayerBuilder.current = createLayerBuilder(map.current)
        }
        return ()=>{
            console.log("Destroy Map");
                if(map.current) {
                    map.current.destroy();
                    map.current =  null;
                }
        }
    }, []);

    useEffect(()=>{
        if (masterLayerBuilder.current && props.command) {
            masterLayerBuilder.current.handleCommand(props.command)
        }
    }, [props.command]);

    return (
        <div className="LuciadMap" ref={element}/>
    )
}

export {
    LuciadMap
}