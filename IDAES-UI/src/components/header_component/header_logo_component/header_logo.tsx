import css from './header_logo.module.css';

export default function HeaderLogo() {
  return(
    <section id="headerLogoContainer" className={`headerLogoContainer ${css.headerLogoContainer}`}>
      <img src="/assets/image/idaes-logo.png" 
          alt="idaes logo for header component" 
          id="headerLogo" 
          className={`${css.headerLogo}`}
      />
      <p id="headerLogoText" className={`${css.headerLogoText}`}>IDAES</p>
    </section>
  )
}