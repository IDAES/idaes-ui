import react from "react"
import css from "./message_bar.module.css";

enum a {
    test = 1,
    aha = 2,
    fuck = 3
}

console.log(a)

export default function MessageBar(props:any){
    let messageType: string;
    props.messageType ? messageType = props.messageType : messageType = "note";
    return (
        <>
            <div className={css.message_bar_container}>
            </div>
        </>
    )
}