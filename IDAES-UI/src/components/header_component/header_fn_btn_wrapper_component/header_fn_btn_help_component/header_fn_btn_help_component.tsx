import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import css from './header_fn_btn_help.module.css';

export default function HeaderFNBtnHelp(){
    return(
        <li id="help_btn" className={`header_each_btn`}>
            <FontAwesomeIcon icon={faCircleQuestion} className="mr-sm"/>
            <a href="https://idaes-pse.readthedocs.io/en/latest/tutorials/getting_started/index.html" target="_blank" className={`${css.link}`}>Help</a>
        </li>
    )
}