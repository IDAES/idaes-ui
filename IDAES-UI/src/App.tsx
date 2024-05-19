import Header from "./header/Header";
import AppContentWrapper from './AppContentWrapper';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

function App() {
  return (
        <main id="main" className="main">
          <Header/>
          <AppContentWrapper />
        </main>
  )
}

export default App