
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Login from "./components/Login";
import LoanForm from './components/LoanForm'
import './App.css'

const App = () => (
  <Router className="app">
    <Routes>
      <Route exact path="/login" element={<Login />} />
      <Route exact path="/loans" element={<LoanForm />} />
    </Routes>
  </Router>
)

export default App;
