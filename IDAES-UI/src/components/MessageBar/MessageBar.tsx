import css from "./MessageBar.module.css";

/**
 * @param props 
 * @returns Message bar component. display message at bottom of the screen
 */
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