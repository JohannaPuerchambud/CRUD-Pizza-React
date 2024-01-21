import { Routes, Route, BrowserRouter } from "react-router-dom";
import ShowPizzas from './components/showPizzas';
import ShowPizzas from './components/showPizzas';
import ShowIngredientes from './components/showIngredientes';
import Navigation from './components/Navigation';

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<ShowPizzas />} />
        <Route path="/pizzas" element={<ShowPizzas />} />
        <Route path="/ingredientes" element={<ShowIngredientes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
