import './index.scss'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import {addReference, parseWellKnownText} from "@luciad/ria/reference/ReferenceProvider";


const reference32747 = parseWellKnownText('PROJCS["WGS 84 / UTM zone 47S",GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",99],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",10000000],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AXIS["Easting",EAST],AXIS["Northing",NORTH],AUTHORITY["EPSG","32747"]]');
const reference4924 = parseWellKnownText('GEOCCS["Mauritania 1999",DATUM["Mauritania_1999",SPHEROID["GRS 1980",6378137,298.257222101,AUTHORITY["EPSG","7019"]],AUTHORITY["EPSG","6702"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AXIS["Geocentric X",OTHER],AXIS["Geocentric Y",OTHER],AXIS["Geocentric Z",NORTH],AUTHORITY["EPSG","4924"]]')
const reference2945 = parseWellKnownText("PROJCS[\"NAD83(CSRS) / MTM zone 3\",GEOGCS[\"NAD83(CSRS)\",DATUM[\"NAD83 Canadian Spatial Reference System\",SPHEROID[\"GRS 1980\",6378137.0,298.257222101],TOWGS84[0.0,0.0,0.0]],PRIMEM[\"Greenwich\",0.0],UNIT[\"degree\",0.017453292519943295],AXIS[\"Geodetic latitude\",NORTH],AXIS[\"Geodetic longitude\",EAST]],PROJECTION[\"Transverse Mercator\"],PARAMETER[\"Latitude of natural origin\",0.0],PARAMETER[\"central_meridian\",-58.5],PARAMETER[\"Scale factor at natural origin\",0.9999],PARAMETER[\"False easting\",304800.0],PARAMETER[\"False northing\",0.0],UNIT[\"Meter\",1.0],AXIS[\"Easting\",EAST],AXIS[\"Northing\",NORTH]]")

addReference(reference32747)
addReference(reference4924)
addReference(reference2945, "EPSG:2945")

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  //<React.StrictMode>
    <App />
  //</React.StrictMode>,
)
