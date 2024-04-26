// // if has layoutInLocalStorage means there is a stored layout then parse it to Obj use as most recent layout.
        // // layout is frequently updated when mosaic window on change
        // if(mosaicLayout){
        //     // parse the local storage stored mosaic layout 
        //     mosaicLayout = JSON.parse(mosaicLayout);

        //     // parse the local storage diagnostics panel params this 100% there and update when mosaic window on change!
        //     let diagnosticsPanelParams: {
        //         direction: string,
        //         diagnosticsPanelLocationInItem: string,
        //         diagnosticsPanelLocationInObj: string, 
        //         diagnosticsPanelStayWith: string,
        //         splitPercentage: number,
        //     };

        //     // local storage GET diagnosticsPanelParams validation
        //     let getDiagnosticsPanelParamsFromLocalStorage = localStorage.getItem("diagnosticsPanelParams");
        //     if(getDiagnosticsPanelParamsFromLocalStorage){
        //         // if has read from local
        //         diagnosticsPanelParams = JSON.parse(getDiagnosticsPanelParamsFromLocalStorage);
        //     }else{
        //         // if not has, initial diagnostics panel location
        //         initialDiagnosticsPanelParams();
        //         diagnosticsPanelParams = JSON.parse(localStorage.getItem("diagnosticsPanelParams")!); // here use ! 100% get value from local storage
        //     }

            
        //     // diagnostics on
        //     // when diagnostics panel is show restore diagnostics
        //     if(panelState.diagnostics.show){
        //         if( diagnosticsPanelParams.diagnosticsPanelLocationInItem && 
        //             diagnosticsPanelParams.diagnosticsPanelLocationInObj &&
        //             diagnosticsPanelParams.diagnosticsPanelStayWith
        //         ){
        //             Object.keys(mosaicLayout).forEach((el)=>{
        //                 // check the mosaic layout item should contain diagnostics panel
        //                 if(el == diagnosticsPanelParams.diagnosticsPanelLocationInItem){
        //                     // obj type of mosaic panel
        //                     // when the element should contain diagnostics is a object: {first:{direction:"row", first:"flowsheet"...}}
        //                     if(typeof(mosaicLayout[el]) == "object"){
        //                         // reassign this panel obj with direction in diagnosticsPanelParams
        //                         if(diagnosticsPanelParams.direction){
        //                             mosaicLayout[el].direction = diagnosticsPanelParams.direction;
        //                         }else{
        //                             mosaicLayout[el].direction = "row"; // default value
        //                         }
        //                         // reassign reassign this panel obj with split percentage in diagnosticsPanelParams
        //                         if(diagnosticsPanelParams.splitPercentage){
        //                             mosaicLayout[el].splitPercentage = diagnosticsPanelParams.splitPercentage;
        //                         }else{
        //                             mosaicLayout[el].splitPercentage = 55; // default value
        //                         }
                                
        //                         // loop mosaicLayout sub obj which contains diagnostics, to make sure it's only contain one diagnostics panel with key diagnosticsPanelParams.diagnosticsPanelLocationInObj
        //                         Object.keys(mosaicLayout[el]).forEach(subEl=>{
        //                             // this check and delete to prevent duplicated "diagnostics" assign to mosaicLayout
        //                             if(mosaicLayout[el][subEl] == "diagnostics"){
        //                                 delete mosaicLayout[el][subEl];
        //                             }
        //                             // reassign key values for direction splitPercentage, and diagnostics base on diagnosticsPanelParams
        //                             mosaicLayout[el][diagnosticsPanelParams.diagnosticsPanelLocationInObj] = "diagnostics";
        //                         })
        //                     }
                            
        //                     // string type of mosaic panel
        //                     // when the element should contain diagnostics is a string: {first: "flowsheet"...}
        //                     // when mosaicLayout[el] is string rebuild it to obj
        //                     if(typeof(mosaicLayout[diagnosticsPanelParams.diagnosticsPanelLocationInItem]) == "string"){
        //                         // restore diagnostics panel when it was nested with other element
        //                         if(diagnosticsPanelParams.diagnosticsPanelLocationInObj && diagnosticsPanelParams.diagnosticsPanelStayWith){
        //                             // copy old panel value
        //                             const copyCurrentValue = mosaicLayout[el];
        //                             // initial a new obj to restore diagnostics panel init.
        //                             mosaicLayout[el] = {};
        //                             mosaicLayout[el].direction = diagnosticsPanelParams.direction;
        //                             // conditionally render diagnostics panel as first or second
        //                             mosaicLayout[el].first = diagnosticsPanelParams.diagnosticsPanelLocationInObj == "first" ? "diagnostics" : copyCurrentValue;
        //                             mosaicLayout[el].second = diagnosticsPanelParams.diagnosticsPanelLocationInObj == "second" ? "diagnostics" : copyCurrentValue;

        //                             mosaicLayout[el].splitPercentage = diagnosticsPanelParams.splitPercentage;
        //                         }

        //                         // restore diagnostics panel when it stand alone
        //                         if(!diagnosticsPanelParams.diagnosticsPanelLocationInObj && !diagnosticsPanelParams.diagnosticsPanelStayWith){
        //                             const otherElement = diagnosticsPanelParams.diagnosticsPanelLocationInItem == "first" ? "second" : "first";
        //                             const copyMosaicLayout = {...mosaicLayout};
        //                             console.log(diagnosticsPanelParams.direction)
        //                             mosaicLayout.direction = diagnosticsPanelParams.direction;
        //                             mosaicLayout = {
        //                                 direction: diagnosticsPanelParams.direction || "row",
        //                                 splitPercentage : diagnosticsPanelParams.splitPercentage,
        //                                 otherElement: {
        //                                     direction: copyMosaicLayout.direction,
        //                                     splitPercentage: copyMosaicLayout.splitPercentage,
        //                                     first: copyMosaicLayout.first,
        //                                     second: copyMosaicLayout.second
        //                                 }
        //                             }

        //                             mosaicLayout[diagnosticsPanelParams.diagnosticsPanelLocationInItem] = "diagnostics";
        //                             localStorage.setItem("mosaicLayout", JSON.stringify(mosaicLayout))
        //                         }
        //                     }
        //                 }
        //             })
        //         }else if(
        //             diagnosticsPanelParams.diagnosticsPanelLocationInItem && 
        //             !diagnosticsPanelParams.diagnosticsPanelLocationInObj &&
        //             !diagnosticsPanelParams.diagnosticsPanelStayWith
        //         ){
        //             let otherPanels:any = {};
        //             Object.keys(mosaicLayout).forEach(el=>{
        //                 otherPanels[el] = mosaicLayout[el];
        //             });
        //             console.log(otherPanels)

        //             // if(diagnosticsPanelParams.diagnosticsPanelLocationInItem){
        //             //     if(diagnosticsPanelParams.diagnosticsPanelLocationInItem == "first"){
        //             //         mosaicLayout["first"] = "diagnostics";
        //             //         mosaicLayout["second"] = otherPanels;
        //             //     }else{
        //             //         mosaicLayout["first"] = otherPanels;
        //             //         mosaicLayout["second"] = "diagnostics";
        //             //     }

        //             //     mosaicLayout.direction = diagnosticsPanelParams.direction || "row";
        //             //     mosaicLayout.splitPercentage = diagnosticsPanelParams.splitPercentage || 55;
        //             // }

        //             // localStorage.setItem("mosaicLayout", JSON.stringify(mosaicLayout))
        //         }
        //     }

        //     // diagnostics off
        //     // when diagnostics panel is hide, save current diagnostics panel's location info to diagnosticsPanelParam and remove diagnostics panel
        //     if(!panelState.diagnostics.show){
        //         Object.keys(mosaicLayout).forEach((el)=>{
        //             if(el == diagnosticsPanelParams.diagnosticsPanelLocationInItem){
        //                 // close diagnostics panel
        //                 if(typeof(mosaicLayout[el]) == "object"){
        //                     Object.keys(mosaicLayout[el]).forEach(subEl=>{
        //                         if(mosaicLayout[el][subEl] == "diagnostics"){
        //                             let otherPanel:string;
        //                             subEl == "first" ? otherPanel = "second" : otherPanel = "first";
        //                             mosaicLayout[el] = mosaicLayout[el][otherPanel];
        //                         }
        //                     })
        //                     localStorage.setItem("diagnosticsPanelParams", JSON.stringify(diagnosticsPanelParams));
        //                 }

        //                 if(typeof(mosaicLayout[el]) == "string" && mosaicLayout[el] == "diagnostics"){
        //                     const otherElement = el == "first" ? "second" : "first";
        //                     const updateMosaicLayout:any = {
        //                         direction: mosaicLayout[otherElement].direction || "row",
        //                         splitPercentage:  mosaicLayout[otherElement].splitPercentage || 55,
        //                         first: mosaicLayout[otherElement].first,
        //                         second: mosaicLayout[otherElement].second
        //                     }
        //                     mosaicLayout = updateMosaicLayout;
        //                 }
        //             }
        //         })
        //     }
        // }