
import ReactPaginate from 'react-paginate';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { showAlert } from '../functions';
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
/>
import Modal from 'react-modal';  // Import React Modal

const MySwal = withReactContent(Swal);

Modal.setAppElement('#root');

const ShowPizzas = () => {
  const url = 'http://localhost:3000/pizzas';
  const [pizzas, setPizzas] = useState([]);
  const [filtrarPizzas, setFiltrarPizzas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [piz_id, setId] = useState('');
  const [piz_name, setName] = useState('');
  const [piz_origin, setOrigin] = useState('');
  const [piz_state, setState] = useState(true);
  const [operation, setOperation] = useState(1);
  const [title, setTitle] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [entriesToShow, setEntriesToShow] = useState(5);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [modalIsOpen, setIsOpen] = useState(false);
  // Corrected handleChange for piz_state to properly store the selected value
  const handleStateChange = (e) => {
    setState(e.target.value === 'true'); // Changed to directly set boolean value
  };
  const handleNameChange = (e) => {
    setName(e.target.value); // Actualizar el estado con el valor del input
  };
  const handlePageClick = (event) => {
    const newPage = event.selected;
    setCurrentPage(newPage);
  };

  const handleEntriesChange = (event) => {
    const newEntriesToShow = Number(event.target.value);
    setEntriesToShow(newEntriesToShow);
    setRecordsPerPage(newEntriesToShow);
  };


  useEffect(() => {
    getPizzas();
  }, []);

  useEffect(() => {
    const results = searchTerm
      ? pizzas.filter(pizza =>
        pizza.piz_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      : pizzas;
    setFiltrarPizzas(results);

    const totalPizzas = results.length;
    setPageCount(Math.ceil(totalPizzas / entriesToShow));
  }, [searchTerm, pizzas, entriesToShow]);

  const getPizzasToShow = () => {
    const start = currentPage * entriesToShow;
    const end = start + entriesToShow;
    return filtrarPizzas.slice(start, end);
  };

  const { list: pizzasToShow, start } = getPizzasToShow();

  const getPizzas = async () => {
    try {
      const response = await axios.get(url);
      setPizzas(response.data);
    } catch (error) {
      console.error("Error fetching pizzas:", error);
      showAlert('Error fetching pizzas', 'error');
    }
  };

  const openModal = (op, piz_id = '', piz_name = '', piz_origin = '', piz_state = '') => {
    // Set the states with the provided values or default to empty strings
    setId(piz_id);
    setName(piz_name);
    setOrigin(piz_origin);
    setState(piz_state);
    setOperation(op);

    setTitle(op === 1 ? 'Registrar pizza' : 'Editar pizza');

    window.setTimeout(() => {
      document.getElementById('piz_name').focus();
    }, 500);
    setIsOpen(true);
  };
  const closeModal = () => {
    setIsOpen(false); // Close the modal
  };
  const validar = () => {
    let error = false;

    if (!piz_name.trim()) {
      showAlert('Escribe el nombre de la pizza', 'warning');
      error = true;
    }
    if (!piz_origin.trim()) {
      showAlert('Escribe el origen de la pizza', 'warning');
      error = true;
    }
    if (piz_state !== true && piz_state !== false) {
      showAlert('Escribe el estado de la pizza', 'warning');
      error = true;
    }

    if (!error) {
      const parametros = {
        piz_name: piz_name.trim(),
        piz_origin: piz_origin.trim(),
        piz_state: piz_state, 
      };
      if (operation === 2) {
        parametros.piz_id = piz_id; // Add the ID only for updating
      }

      enviarSolicitud(operation === 1 ? 'POST' : 'PUT', parametros, () => {
        // Callback function to reload the page
        window.location.reload();
      });
    }
  };
  const enviarSolicitud = async (metodo, parametros, callback) => {
    try {
      let endpoint = url;
      let config = {};

      // Adjust the endpoint and config based on the method
      if (metodo === 'POST' || metodo === 'PUT') {
        // Convert object to query string for POST and PUT
        const queryParams = new URLSearchParams(parametros).toString();
        endpoint += '?' + queryParams;
        config = {
          method: metodo,
          url: endpoint,
          headers: {
            'Content-Type': 'application/json'
          }
        };
      } else if (metodo === 'DELETE') {
        // Append piz_id as query param for DELETE
        endpoint += `?piz_id=${parametros.piz_id}`;
        config = {
          method: metodo,
          url: endpoint,
        };
      }

      const response = await axios(config);
      //if (response.status === 404) {
        // Process response.data
        console.log(response);
        if (callback && response.status === 200) {
          callback();
        }
      //}
      // Rest of your response handling code...
    } catch (error) {
      // Error handling
      console.error("Error in enviarSolicitud:", error);
    }
  }

  const deletePizza = (piz_id, piz_name) => {
    // ...
    MySwal.fire({
      title: `¿Seguro de eliminar el producto ${piz_name}?`,
      icon: 'question',
      text: 'No se podrá dar marcha atrás',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        enviarSolicitud('DELETE', { piz_id: piz_id });
        window.location.reload();
      } else {
        showAlert('El producto NO fue eliminado', 'info');
      }
    });
  }

  return (
    <div className='App'>
      <div className='container-fluid'>
        <div className='row mb-3'>
          <div className='col-12'>
            <h2 className='text-center p-3'>Administración de Pizzas</h2>
          </div>
        </div>

        <div className='row mb-3'>
          <div className='col-12 d-flex justify-content-center'>
            <button onClick={() => openModal(1)} className='btn btn-dark' data-bs-toggle='modal' data-bs-target='#modalpizzas'>
              <i className='fa-solid fa-circle-plus'></i> Añadir
            </button>
          </div>
          <div />
        </div>

        <div className='col-lg-6'></div>

        <div className='col-lg-8 offset-lg-2'>
          <div className='d-flex justify-content-end mb-3'>
            <div className="input-group w-auto">
              <input
                type='text'
                className='form-control'
                placeholder='Search...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ borderColor: 'black' }}
              />
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='col-12 col-lg-8 offset-0 offset-lg-2'>
            <div className='table-responsive'>
              <table className='table table-bordered'>
                <thead>
                  <tr><th>ID</th><th>NOMBRE</th><th>ORIGEN</th><th>ESTADO</th><th>OPCIONES</th></tr>
                </thead>
                <tbody className='table-group-divider'>
                  {
                    filtrarPizzas
                      .slice(currentPage * recordsPerPage, (currentPage * recordsPerPage) + recordsPerPage)
                      .map((pizza, index) => (
                        <tr key={pizza.piz_id}>
                          <td>{(currentPage * recordsPerPage) + index + 1}</td>
                          <td>{pizza.piz_name}</td>
                          <td>{pizza.piz_origin}</td>
                          <td>{pizza.piz_state ? 'True' : 'False'}</td>
                          <td>
                            <button onClick={() => openModal(2, pizza.piz_id, pizza.piz_name, pizza.piz_origin, pizza.piz_state)} className='btn btn-warning'>
                              <i className='fa-solid fa-edit'></i>
                            </button>
                            &nbsp;
                            <button onClick={() => deletePizza(pizza.piz_id, pizza.piz_name)} className='btn btn-danger'>
                              <i className='fa-solid fa-trash'></i>
                            </button>
                          </td>
                        </tr>
                      ))
                  }

                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='col-12 d-flex justify-content-center'>
            <ReactPaginate
              previousLabel={'Anterior'}
              nextLabel={'Siguiente'}
              breakLabel={'...'}
              pageCount={pageCount} // Set the dynamic page count
              onPageChange={handlePageClick}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              containerClassName={'pagination'} // Clase para el contenedor
              pageClassName={'page-item'} // Clase para cada página
              pageLinkClassName={'page-link'} // Clase para el enlace de cada página
              previousClassName={'page-item'}
              previousLinkClassName={'page-link'}
              nextClassName={'page-item'}
              nextLinkClassName={'page-link'}
              breakClassName={'page-item'}
              breakLinkClassName={'page-link'}
              activeClassName={'active'} // Clase para la página activa
            />
          </div>
        </div>
        <div className='row'>
          <div className='col-12 d-flex justify-content-center'>
            <label htmlFor="entriesToShow" className="me-2 align-self-center">Mostrar</label>
            <select
              id="entriesToShow"
              className='form-select'
              style={{ width: 'auto' }}
              value={entriesToShow}
              onChange={handleEntriesChange}
            >
              <option value="1">1</option>
              <option value="5">5</option>
              <option value="10">10</option>
              {/* Agregar más opciones de ser necesario */}
            </select>
            <span className="ms-2 align-self-center">entradas</span>
          </div>
        </div>


      </div>
      <div id='modalpizzas' className='modal fade' aria-hidden='true'>
        <div className='modal-dialog'>
        <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Pizza Modal"
        className="Modal"
        overlayClassName="Overlay"
      >
          <div className='modal-content'>
            <div className='modal-header'>
              <label className='h5'>{title}</label>
              <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
            </div>
            <div className='modal-body'>
              <input type='hidden' id='piz_id' value={piz_id}></input>
              <div className='input-group mb-3'>
                <span className='input-group-text'><i className='fa-solid fa-gift'></i></span>
                <input type='text' id='piz_name' className='form-control' placeholder='Nombre' value={piz_name}
                  onChange={handleNameChange}></input>
              </div>
              <div className='input-group mb-3'>
                <span className='input-group-text'><i className='fa-solid fa-comment'></i></span>
                <input type='text' id='piz_origin' className='form-control' placeholder='Origen' value={piz_origin}
                  onChange={(e) => setOrigin(e.target.value)}></input>
              </div>
              <div className='input-group mb-3'>
                <span className='input-group-text'><i className='fa-solid fa-clipboard-question'></i></span>
                <select
                  id='piz_state'
                  className='form-control'
                  value={piz_state ? "true" : "false"}
                  onChange={handleStateChange}
                >
                  <option value="" disabled>- Seleccione el estado -</option> {/* Opción por defecto */}
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </div>
          </div>

          <div className='row'>
            <div className='col-12 col-lg-8 offset-0 offset-lg-2'>
              <div className='table-responsive'>
                <table className='table table-bordered '>
                  <thead class='thead-dark'>
                    <tr><th>ID</th><th>NOMBRE</th><th>ORIGEN</th><th>ESTADO</th><th>OPCIONES</th></tr>
                  </thead>
                  <tbody className='table-group-divider'>
                    {getPizzasToShow().map((pizzas, i) => (
                      <tr key={pizzas.piz_id}>
                        <td>{(start + i + 1)}</td>
                        <td>{pizzas.piz_name}</td>
                        <td>{pizzas.piz_origin}</td>
                        <td>{pizzas.piz_state ? 'True' : 'False'}</td>
                        <td>
                          <button onClick={() => openModal(2, pizzas.piz_id, pizzas.piz_name, pizzas.piz_origin, pizzas.piz_state)} className='btn btn-success' data-bs-toggle='modal' data-bs-target='#modalpizzas'>
                            <i className='fa-solid fa-edit'></i>
                          </button>
                          &nbsp;
                          <button onClick={() => deletePizza(pizzas.piz_id, pizzas.piz_name)} className='btn btn-info'>
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
          <div className='row'>
            <div className='col-12 d-flex justify-content-center'>
              <ReactPaginate
                previousLabel={'Anterior'}
                nextLabel={'Siguiente'}
                breakLabel={'...'}
                pageCount={pageCount} // Set the dynamic page count
                onPageChange={handlePageClick}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                containerClassName={'pagination'} // Clase para el contenedor
                pageClassName={'page-item'} // Clase para cada página
                pageLinkClassName={'page-link'} // Clase para el enlace de cada página
                previousClassName={'page-item'}
                previousLinkClassName={'page-link'}
                nextClassName={'page-item'}
                nextLinkClassName={'page-link'}
                breakClassName={'page-item'}
                breakLinkClassName={'page-link'}
                activeClassName={'active'} // Clase para la página activa
              />
            </div>
          </div>
          <div className='row'>
            <div className='col-12 d-flex justify-content-center'>
              <label htmlFor="entriesToShow" className="me-2 align-self-center">Mostrar</label>
              <select
                id="entriesToShow"
                className='form-select'
                style={{ width: 'auto' }}
                value={entriesToShow}
                onChange={handleEntriesChange}
              >
                <option value="1">1</option>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="10">15</option>
                {/* Agregar más opciones de ser necesario */}
              </select>
              <span className="ms-2 align-self-center">entradas</span>
            </div>
          </div>
        </div>
        <div id='modalpizzas' className='modal fade' aria-hidden='true'>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <label className='h5'>{title}</label>
                <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
              </div>
              <div className='modal-body'>
                <input type='hidden' id='piz_id'></input>
                <div className='input-group mb-3'>
                  <span className='input-group-text'><i className='fa-solid fa-hashtag'></i></span>
                  <input type='text' id='piz_id' className='form-control' placeholder='Id' value={piz_id}
                    onChange={(e) => setId(e.target.value)}></input>
                </div>
                <div className='input-group mb-3'>
                  <span className='input-group-text'><i className='fa-solid fa-gift'></i></span>
                  <input type='text' id='piz_name' className='form-control' placeholder='Nombre' value={piz_name}
                    onChange={(e) => setName(e.target.value)}></input>
                </div>
                <div className='input-group mb-3'>
                  <span className='input-group-text'><i className='fa-solid fa-comment'></i></span>
                  <input type='text' id='piz_origin' className='form-control' placeholder='Origen' value={piz_origin}
                    onChange={(e) => setOrigin(e.target.value)}></input>
                </div>
                <div className='input-group mb-3'>
                  <span className='input-group-text'><i className='fa-solid fa-clipboard-question'></i></span>
                  <select
                    id='piz_state'
                    className='form-control'
                    value={piz_state}
                    onChange={(e) => setState(e.target.value === 'true')}
                  >
                    <option value="" disabled selected>- Seleccione el estado -</option> {/* Opción por defecto */}
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </div>

                <div className='d-grid col-6 mx-auto'>
                  <button onClick={() => validar()} className='btn btn-success'>
                    <i className='fa-solid fa-floppy-disk'></i> Guardar
                  </button>
                </div>
              </div>
              <div className='modal-footer'>
                <button type='button' onClick={closeModal} className='btn btn-secondary'>Cerrar</button>
              </div>
            </div>
            </Modal>
        </div>
        </div>
      </div>
      );
};

      export default ShowPizzas