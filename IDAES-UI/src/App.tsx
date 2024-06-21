import Header from "@/header/Header";
import AppContentWrapper from '@/AppContentWrapper';

// Return component App
export default function App() {
  return (
        <main id="main" className="main">
          <Header/>
          <AppContentWrapper />
        </main>
  )
}