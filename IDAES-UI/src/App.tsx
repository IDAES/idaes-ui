import Header from "./components/header_component/header";
import FlowsheetWrapper from './components/flowsheet_main_component/flowsheet_wrapper';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

function App() {
  return (
        <main id="main" className="main">
          <Header/>
          <FlowsheetWrapper />
        </main>
  )
}

export default App