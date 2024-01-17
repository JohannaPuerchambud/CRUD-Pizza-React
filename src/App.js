import { Routes, Route, BrowserRouter } from "react-router-dom";
import showPizzas from './components/showPizzas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element = {<showPizzas></showPizzas>}></Route>
      </Routes>
    
    </BrowserRouter>
  )
}

export default App;
