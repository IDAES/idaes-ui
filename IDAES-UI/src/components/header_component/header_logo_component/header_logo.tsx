import css from './header_logo.module.css';
import idaes_logo from '../../../assets/images/idaes-logo.png';

export default function HeaderLogo() {
  return(
    <section id="headerLogoContainer" className={`headerLogoContainer ${css.headerLogoContainer}`}>
      <img src={idaes_logo} 
          alt="idaes logo for header component" 
          id="headerLogo" 
          className={`${css.headerLogo}`}
      />
      <p id="headerLogoText" className={`${css.headerLogoText}`}>IDAES</p>
    </section>
  )
}