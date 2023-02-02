import "./Desktop.scss"
import React from "react";
import {LayerBuilder} from "./luciad/factories/LayerBuilder";

interface Props {
    children?: React.ReactNode
}

const Desktop: React.FC<Props> = (props:Props) => {
    return (<div className="Desktop">
        {props.children}
    </div>)
}

export {
    Desktop
}