import './App.scss'

import {AppNavbar} from "./components/AppNavbar";
import {Desktop} from "./components/Desktop";
import React, {useRef, useState} from "react";
import {FormTest2} from "./components/forms/FormTest2";
import {SliderPanels, SliderPanelsRef} from "./components/SliderPanels/SliderPanels";
import {Command, CommandType} from "./commands/Command";
import {LuciadMap} from "./components/luciad/LuciadMap";
import {DynamicForms} from "./components/forms/DynamicForms";
import {ConnectTMSForm} from "./components/forms/connect/ConnectTMSForm";
import {ConnectOpenAPITilesForm} from "./components/forms/connect/ConnectOpenAPITilesForm";
import {ConnectOpenAPIMapsForm} from "./components/forms/connect/ConnectOpenAPIMapsForm";
import {ConnectOpenAPIFeaturesForm} from "./components/forms/connect/ConnectOpenAPIFeaturesForm";

const forms = new DynamicForms();
forms.register({uid: "ConnectTMS", form: <ConnectTMSForm />})
forms.register({uid: "ConnectOpenAPITiles", form: <ConnectOpenAPITilesForm />})
forms.register({uid: "ConnectOpenAPIMaps", form: <ConnectOpenAPIMapsForm />})
forms.register({uid: "ConnectOpenAPIFeatures", form: <ConnectOpenAPIFeaturesForm />})

forms.register({uid: "ConnectWMS", form: <FormTest2 />})

function App() {
  const [command, setCommand] = useState(null as (Command | null));
  const formRef = useRef(null as SliderPanelsRef | null);

  const handleCommand = (command: Command) => {
      switch (command.type) {
          case CommandType.CreateForm:
              const form = forms.getForm(command.parameters.formId);
              if (formRef.current) formRef.current?.addFormLeft(form);
              break;
          case CommandType.OpenForm2:
              if (formRef.current) formRef.current?.addFormLeft(<FormTest2 />);
              break;
          case CommandType.CreateAnyLayer:
              setCommand(command);
              break;
      }
  }

  return (
    <div className="App">
        <div className="navbar-holder">
            <AppNavbar handleCommand={handleCommand}/>
        </div>
        <div className="desktop-holder">
            <Desktop >
                <div className="map-holder">
                    <LuciadMap command={command}/>
                </div>
                <SliderPanels ref={formRef} handleCommand={handleCommand}/>
            </Desktop>
        </div>
    </div>
  )
}

export default App
