
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { showAlert } from '../functions';

const ShowPizzas = () => {
  const url = 'http://localhost:3000/pizzas';
  const [pizzas, setPizzas] = useState([]);
  const [piz_id, setId] = useState('');
  const [piz_name, setName] = useState('');
  const [piz_origin, setOrigin] = useState('');
  const [piz_state, setState] = useState('');
  const [operation, setOperation] = useState(1);
  const [title, setTitle] = useState('');

  useEffect(() => {
    getPizzas();
  }, []);

  const getPizzas = async () => {
    try {
      const response = await axios.get(url);
      console.log(response.data); // Check what the API is returning
      setPizzas(response.data);
    } catch (error) {
      console.error("Error fetching pizzas:", error);
    }
  };

  const openModal = (op, piz_id, piz_name, piz_origin, piz_state) => {
    setId('');
    setName('');
    setOrigin('');
    setState('');
    setOperation(op);
    if (op == 1) {
      setTitle('Registrar pizza');
    } else if (op == 2) {
      setTitle('Editar pizza');
      setId(piz_id);
      setName(piz_name);
      setOrigin(piz_origin);
      setState(piz_state);
    }
    window.setTimeout(function () {
      document.getElementById('piz_name').focus();

    }, 500);
  }

  console.log(Array.isArray(pizzas));
  return (
    <div className='App'>
      <div className='container-fluid'>
        <div className='row mt-3'>
          <div className='col-md-4 offset-md-4'>
            <h2 className='text-center p-3'>Administración de Pizzas</h2>
            <div className='d-grid mx-auto'>
              <button onClick={() => openModal(1)} className='btn btn-dark' data-bs-toggle='modal' data-bs-target='#modalpizzas'>
                <i className='fa-solid fa-circle-plus'></i> Añadir
              </button>
            </div>
          </div>
        </div>
        <div className='row mt-3'>
          <div className='col-12 col-lg-8 offset-0 offset-lg-2'>
            <div className='table-responsive'>
              <table className='table table-bordered'>
                <thead>
                  <tr><th>ID</th><th>NOMBRE</th><th>ORIGEN</th><th>ESTADO</th><th></th></tr>
                </thead>
                <tbody className='table-group-divider'>
                  {pizzas.map((pizzas, i) => (
                    <tr key={pizzas.piz_id}>
                      <td>{(i + 1)}</td>
                      <td>{pizzas.piz_name}</td>
                      <td>{pizzas.piz_origin}</td>
                      <td>{pizzas.piz_state}</td>
                      <td>
                        <button onClick={() => openModal(2, pizzas)} className='btn btn-warning' data-bs-toggle='modal' data-bs-target='#modalpizzas'>
                          <i className='fa-solid fa-edit'></i>
                        </button>
                        &nbsp;
                        <button className='btn btn-danger'>
                          <i className='fa-solid fa-trash'></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div id='modalpizzas' className='modal fade' aria-hidden='true'>
        <div className='modal-dialog'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>{title}</h5>
              <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
            </div>
            <div className='modal-body'>
              <input type='hidden' id='piz_id' value={piz_id}></input>
              <div className='input-group mb-3'>
                <span className='input-group-text'><i className='fa-solid fa-pizza-slice'></i></span>
                <input type='text' id='piz_name' className='form-control' placeholder='Nombre' value={piz_name}
                  onChange={(e) => setName(e.target.value)}></input>
                <div className='input-group mb-3'>
                  <span className='input-group-text'><i className='fa-solid fa-earth-americas'></i></span>
                  <input type='text' id='piz_origin' className='form-control' placeholder='Origen' value={piz_origin}
                    onChange={(e) => setOrigin(e.target.value)}></input>
                </div>
                <div className='input-group mb-3'>
                  <span className='input-group-text'><i className='fa-solid fa-clipboard-question'></i></span>
                  <input type='text' id='piz_state' className='form-control' placeholder='Estado' value={piz_state}
                    onChange={(e) => setState(e.target.value)}></input>
                </div>
                <div className='d-grid col-6 mx-auto'>
                  <button className='btn btn-success'>
                    <i className='fa-solid fa-floppy-disk'></i> Guardar
                  </button>
                </div>
              </div>
              <div className='modal-footer'>
                <button type='button' className='btn btn-secondary' data-bs-dismiss='modal'>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowPizzas