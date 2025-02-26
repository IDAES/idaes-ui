import css from "./MessageBar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
export function messageBarTemplateGenerator(whichCalled: string, succeed: boolean, error?: any) {

    let templateBgClass: string = "bg-successful";
    succeed ? templateBgClass = "bg-successful" : templateBgClass = "bg-error";
    // initial message and conditionally render message
    let message: string = "loading...";

    // refresh flowsheet
    if (whichCalled == "refreshFS" && succeed) {
        message = "Flowsheet refreshed.";
    }

    if (whichCalled == "refreshFS" && !succeed) {
        message = "Flowsheet refresh failed! Please reload the page!";
    }

    // userSave flowsheet
    if (whichCalled == "userSave" && succeed) {
        message = "Flowsheet saved.";
    }

    if (whichCalled == "userSave" && !succeed) {
        message = "Flowsheet save failed! Please restart the server!";
    }

    // diagnostics refresh
    if (whichCalled == "diagnosticRefresh" && succeed) {
        message = "Diagnostics refreshed.";
    }

    if (whichCalled == "diagnosticRefresh" && !succeed) {
        message = "Diagnostics refresh failed! Please restart the server!";
    }

    // diagnostics fn run
    if (whichCalled == "diagnosticFNRunError" && !succeed) {
        let currentError: string | undefined = undefined;
        // error ? message = error : message = `
        message = `Diagnostics failed, check your terminal.`;
    }

    // initial template
    const messageBarTemplate = `
        <div id='messageBarTextContainer' 
            class="${css.messageBarTextContainer} ${!succeed ? css.bg_error : css.bg_successful}"
        >
            <i class="fa-solid fa-circle-check"></i>
            <p>${message}</p>
        </div>
    `;

    // assign template to message bar container
    const messageBarContainer = document.getElementById("messageBarContainer")!;
    messageBarContainer.innerHTML = messageBarTemplate;

    // timeout 1.5 sec remove template 
    const timeOut = setTimeout(() => {
        const readMessageBarTemplate = document.getElementById('messageBarTextContainer');
        if (readMessageBarTemplate) {
            messageBarContainer.removeChild(readMessageBarTemplate)
        } else {
            console.log(`Child node message bar is not found!`)
        }
        clearTimeout(timeOut)
    }, 3000)
}