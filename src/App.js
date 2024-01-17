import { Routes, Route, BrowserRouter } from "react-router-dom";
import ShowPizzas from './components/showPizzas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element = {<ShowPizzas></ShowPizzas>}></Route>
      </Routes>  
    </BrowserRouter>
  )
}

export default App;
