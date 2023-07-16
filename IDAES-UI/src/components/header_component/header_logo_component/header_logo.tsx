import css from './header_logo.module.css';

export default function HeaderLogo() {
  return(
    <img src="/assets/image/idaes-logo.png" alt="idaes logo for header component" className={`${css.header_logo}`}/>
  )
}