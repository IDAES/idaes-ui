import react from "react";
import css from "./message_bar.module.css";

export default function MessageBar(props:any){
    let messageType: string;
    props.messageType ? messageType = props.messageType : messageType = "note";
    return (
        <>
            <div className={css.message_bar_container} id="messageBarContainer">
            </div>
        </>
    )
}