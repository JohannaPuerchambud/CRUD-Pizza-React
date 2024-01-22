import React, { useRef, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import ReactPaginate from 'react-paginate';
import Swal from 'sweetalert2';
import { showAlert } from '../functions';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 10,
    fontFamily: 'Helvetica',
  },
  section: {
    margin: 10,
    padding: 5,
    flexGrow: 0, // Do not allow this section to grow
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 10, // Add some spacing between the title and the table
  },
  tableRow: {
    flexDirection: 'row',
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderBottomWidth: 1,
    alignItems: 'center',
    height: 24, // Set a fixed height for table rows
    fontStyle: 'bold',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderBottomColor: '#000',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#ededed', // Use a different color for header
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCellHeader: {
    margin: 'auto',
    fontSize: 12,
  },
  tableCell: {
    margin: 'auto',
    fontSize: 10,
  },
});

// Create Document Component
const MyPDFDocument = ({ pizzas }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.section}>
        <Text>Administración de Pizzas</Text>
      </View>
      <View style={pdfStyles.table}> 
        {/* Table Header */}
        <View style={pdfStyles.tableRow}>
          <View style={pdfStyles.tableColHeader}>
            <Text style={pdfStyles.tableCellHeader}>ID</Text>
          </View>
          <View style={pdfStyles.tableColHeader}>
            <Text style={pdfStyles.tableCellHeader}>NOMBRE</Text>
          </View>
          <View style={pdfStyles.tableColHeader}>
            <Text style={pdfStyles.tableCellHeader}>ORIGEN</Text>
          </View>
          <View style={pdfStyles.tableColHeader}>
            <Text style={pdfStyles.tableCellHeader}>ESTADO</Text>
          </View>
          {/* More headers... */}
        </View>
        {/* Table Rows */}
        {pizzas.map((pizza, index) => (
          <View key={index} style={pdfStyles.tableRow}>
            <View style={pdfStyles.tableCol}>
              <Text style={pdfStyles.tableCell}>{pizza.piz_id}</Text>
            </View>
            <View style={pdfStyles.tableCol}>
              <Text style={pdfStyles.tableCell}>{pizza.piz_name}</Text>
            </View>
            <View style={pdfStyles.tableCol}>
              <Text style={pdfStyles.tableCell}>{pizza.piz_origin}</Text>
            </View>
            <View style={pdfStyles.tableCol}>
              <Text style={pdfStyles.tableCell}>{pizza.piz_state.toString()}</Text>
            </View>
            {/* More columns... */}
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
/>
Modal.setAppElement('#root');
function getSubstringUntilFirstMatch(str, match) {
  const index = str.indexOf(match);
  if (str !== "Editar" && str.substring(0, index) !== "Editar") {
    return "Asignar";
  }
  if (index === -1) {
    return str; // returns the whole string if the match is not found
  }
  return str.substring(0, index);
}
const ShowPizzas = () => {
  let url = 'http://localhost:3000';
  let url_pizzas = url + "/pizzas";
  let url_ingredients = url + "/pizzaIngredients";
  let selected_ingredients = JSON.parse(localStorage.getItem("ingredients_selected")) || [];
  const [pizzas, setPizzas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [piz_id, setId] = useState('');
  const [piz_name, setName] = useState('');
  const [piz_origin, setOrigin] = useState('');
  const [piz_state, setState] = useState('');
  const [operation, setOperation] = useState(1);
  const [title, setTitle] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [entriesToShow, setEntriesToShow] = useState(5);
  const [error, setError] = useState(null); // New state for tracking errors
  const [ingredients, setIngredients] = useState([]);
  const [ing_name, setIngName] = useState('');
  const [ing_calories, setIngCalories] = useState('');
  const [ing_state, setIngState] = useState('');
  const [pi_portion, setPiPortion] = useState('');
  const [ing_id, setIngId] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [checkboxStates, setCheckboxStates] = useState({});
  const [portionStates, setPortionStates] = useState({});
  const inputRef = useRef(null);
  const checkboxChangeCalled = useRef(new Set());

  const fetchData = useCallback(async (url, setState) => {
    try {
      const response = await axios.get(url);
      setState(response.data);
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
      showAlert('Error fetching data', 'error');
    }
  }, []);
  // Corrected handleChange for piz_state to properly store the selected value
  const handleStateChange = (e) => {
    setState(e.target.value === 'true'); // Changed to directly set boolean value
  };
  const handleCheckboxChange = (id) => {
    setCheckboxStates(prevStates => ({
      ...prevStates,
      [id]: !prevStates[id]
    }));
  };
  const getPizzas = useCallback(() => {
    fetchData(`${url_pizzas}`, setPizzas);
  }, [fetchData]);

  const getIngredients = useCallback(() => {
    fetchData(`${url_ingredients}`, setIngredients);
  }, [fetchData]);
  const handleNameChange = (e) => {
    setName(e.target.value); // Actualizar el estado con el valor del input
  };
  const handlePortionChange = (ingredientId, newPortion) => {
    setPortionStates(prevStates => ({
      ...prevStates,
      [ingredientId]: newPortion === '' ? '' : String(newPortion)
    }));

    // If the portion is not empty and the checkbox is not already checked
    if (newPortion !== '' && !checkboxStates[ingredientId]) {
      handleCheckboxChange(ingredientId);
    }
  };




  const calculatePageCount = (totalItems) => {
    const pageCount = Math.ceil(totalItems / recordsPerPage);
    return pageCount || 1; // Ensure there is at least one page
  };
  const handleEntriesChange = (event) => {
    const newEntriesToShow = Number(event.target.value);
    setEntriesToShow(newEntriesToShow);
    setRecordsPerPage(newEntriesToShow);
  };

  useEffect(() => {
    const initialCheckboxStates = {};
    const initialPortionStates = {};
    ingredients.forEach(ingredient => {
      const selectedIngredient = selectedIngredients.find(selIng => selIng.ing_id === ingredient.ing_id);
      initialCheckboxStates[ingredient.ing_id] = !!selectedIngredient;
      initialPortionStates[ingredient.ing_id] = selectedIngredient ? selectedIngredient.pi_portion : '0';
    });
    setCheckboxStates(initialCheckboxStates);
    setPortionStates(initialPortionStates);
  }, [ingredients, selectedIngredients]);

  useEffect(() => {
    if (modalIsOpen && operation === 2 && piz_id) {
      // Fetch ingredients for the current pizza only if we have a valid piz_id
      fetchData(`${url_ingredients}/${piz_id}`, setSelectedIngredients);
    }
  }, [modalIsOpen, operation, piz_id, url]);


  const handlePageClick = (event) => setCurrentPage(event.selected);

  const filterData = (data) => {
    return data.filter(pizza =>
      pizza.piz_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };


  useEffect(() => {
    setPageCount(Math.ceil(filterData(pizzas).length / recordsPerPage));
  }, [searchTerm, pizzas, recordsPerPage]);

  useEffect(() => {
    fetchData(`${url_pizzas}`, setPizzas);
    fetchData(`${url_ingredients}`, setIngredients);
  }, [fetchData]); // Removed getPizzas and getIngredients from the dependencies array
 
  useEffect(() => {
    getPizzas();
  }, [getPizzas]);

  const openModal = async (op, piz_id = '', piz_name = '', piz_origin = '', piz_state = '', ing_name = '', ing_calories = '', ing_state = '', pi_portion = '', ing_id = '') => {
    setId(piz_id);
    setName(piz_name);
    setOrigin(piz_origin);
    setState(op === 1 ? '' : piz_state); // Set to empty string if adding a new pizza
    setIngName(ing_name);
    setIngCalories(ing_calories);
    setIngState(ing_state);
    setPiPortion(pi_portion);
    setIngId(ing_id);

    setOperation(op);
    setIsOpen(true);
    setTitle(op === 1 ? 'Registrar pizza' : 'Editar pizza');
    checkboxChangeCalled.current.clear();
    window.setTimeout(() => {
      document.getElementById('piz_name').focus();
    }, 500);
    if (op === 2 && piz_id) {
      fetchData(`${url_ingredients}/${piz_id}`, setSelectedIngredients)
        .catch((error) => {
          console.error("Error fetching pizza ingredients:", error);
          // Display the error message to the user
          setError(`Error fetching pizza ingredients: ${error.message}`);
        });
    }
  };

  const closeModal = () => {
    setIsOpen(false); // Close the modal
  };
  const validateForm = () => {
    if (!piz_name.trim()) {
      showAlert('Escribe el nombre de la pizza', 'warning');
      return false;
    }
    if (!piz_origin.trim()) {
      showAlert('Escribe el origen de la pizza', 'warning');
      return false;
    }
    if (piz_state !== true && piz_state !== false) {
      showAlert('Escribe el estado de la pizza', 'warning');
      return false;
    }
    return true;
  };
  const enviarSolicitud = async (metodo, parametros, tipo_registros) => {
    try {
      const queryString = new URLSearchParams({
        pizza: JSON.stringify([parametros])
      }).toString();
      const endpoint = url + "/"+tipo_registros + '?' + queryString;
      let config = {
        method: metodo,
        url: endpoint,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const response = await axios(config);
      console.log(response);
      return response;
    } catch (error) {
      console.error("Error in enviarSolicitud:", error);
      throw error; // Rethrow the error to be handled by the caller
    }
  };

  const handleFormSubmitPizzas = async () => {
    if (!validateForm()) return;

    const parametros = {
      piz_name: piz_name.trim(),
      piz_origin: piz_origin.trim(),
      piz_state: piz_state,
      piz_id: operation === 2 ? piz_id : undefined // Include ID only for updates
    };

    enviarSolicitud(operation === 1 ? 'POST' : 'PUT', parametros, "pizzas")
      .then(() => {
        closeModal(); // Close the modal after the request is successful
        getPizzas(); // Refresh the pizza list
        window.location.reload();
      })
      .catch((error) => {
        // Handle any errors here
        console.error("Error in handleFormSubmit:", error);
        // Optionally, you can choose not to close the modal in case of an error
      });
  };
  const handleFormSubmitIngredients = async () => {
    if (!validateForm()) return;

    // Filtering out only the selected ingredients and mapping them to the required format
    const selectedIngredientParams = ingredients
      .filter(ingredient => checkboxStates[ingredient.ing_id]) // Ensure only selected ingredients are included
      .map(ingredient => ({
        ing_id: ingredient.ing_id,
        portion: portionStates[ingredient.ing_id] || '0' // Use the portion from portionStates
      }));

    // Create a query string
    const queryString = new URLSearchParams({
      piz_id: operation === 2 ? piz_id : undefined,
      piz_name: piz_name.trim(),
      piz_origin: piz_origin.trim(),
      piz_state: piz_state,
      ingredients: JSON.stringify(selectedIngredientParams) // Stringify the ingredients array
    }).toString();

    try {
      let response;
      const endpoint = `${url_ingredients}?${queryString}`;
      if (operation === 1) {
        response = await axios.post(endpoint);
      } else {
        response = await axios.put(endpoint);
      }
      window.location.reload();
      closeModal();
      getIngredients();
    } catch (error) {
      console.error("Error in handleFormSubmitIngredients:", error.response?.data || error);
      // Optionally, display an error message to the user
    }
  };
  const deletePizza = (piz_id, piz_name) => {
    if (!piz_id) {
      showAlert('Id no valido para eliminacion', 'error');
    }
    Swal.fire({
      title: `¿Seguro de eliminar el producto ${piz_name}?`,
      icon: 'question',
      text: 'No se podrá dar marcha atrás',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        enviarSolicitud('DELETE', { piz_id: piz_id }, "pizzas");
        window.location.reload();
      } else {
        showAlert('El producto NO fue eliminado', 'info');
      }
    });
  }
  
  return (
    <>
    <PDFDownloadLink
  document={<MyPDFDocument pizzas={pizzas} />}
  fileName="pizzas.pdf"
>
  {({ blob, url, loading, error }) =>
    loading ? 'Loading document...' : 'Download PDF'
  }
</PDFDownloadLink>
      <div className='App'>
        {error && <div className="alert alert-danger">Error: {error}</div>} { }
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
            {pizzas.length > 0 && (
              <>
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

              </>
            )}

          </div>
          <div className='row mt-3'>
            <div className='col-12 col-lg-8 offset-0 offset-lg-2'>
              <div className='table-responsive'>
                <table className='table table-bordered'>
                  <thead className='thead-dark'>
                    <tr><th>ID</th><th>NOMBRE</th><th>ORIGEN</th><th>ESTADO</th><th>OPCIONES</th></tr>
                  </thead>
                  <tbody className='table-group-divider'>
                    {
                      pizzas.length > 0 ? (
                        filterData(pizzas)
                          .slice(currentPage * recordsPerPage, (currentPage * recordsPerPage) + recordsPerPage)
                          .map((pizza, index) => (
                            // Your existing row rendering logic
                            <tr key={pizza.piz_id}>
                              <td>{(currentPage * recordsPerPage) + index + 1}</td>
                              <td>{pizza.piz_name}</td>
                              <td>{pizza.piz_origin}</td>
                              <td>{pizza.piz_state ? 'True' : 'False'}</td>
                              <td>
                                <button onClick={() => openModal(2, pizza.piz_id, pizza.piz_name, pizza.piz_origin, pizza.piz_state)} className='btn btn-success'
                                  data-bs-toggle='modal' data-bs-target='#modalpizzas'>
                                  <i className='fa-solid fa-edit'></i>
                                </button>
                                &nbsp;
                                <button onClick={() => deletePizza(pizza.piz_id, pizza.piz_name)} className='btn btn-info'>
                                  <i className='fa-solid fa-trash'></i>
                                </button>
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">No hay pizzas para mostrar</td>
                        </tr>
                      )
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className='row'>
            <div className='col-12 d-flex justify-content-center'>
              {pageCount > 0 && (
                <ReactPaginate
                  previousLabel={'Anterior'}
                  nextLabel={'Siguiente'}
                  breakLabel={'...'}
                  pageCount={pageCount}
                  onPageChange={handlePageClick}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={5}
                  containerClassName={'pagination'}
                  pageClassName={'page-item'}
                  pageLinkClassName={'page-link'}
                  previousClassName={'page-item'}
                  previousLinkClassName={'page-link'}
                  nextClassName={'page-item'}
                  nextLinkClassName={'page-link'}
                  breakClassName={'page-item'}
                  breakLinkClassName={'page-link'}
                  activeClassName={'active'}
                />
              )}
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
                <option value="3">3</option>
                <option value="5">5</option>
                <option value="7">7</option>
                <option value="10">10</option>
              </select>
              <span className="ms-2 align-self-center">entradas</span>
            </div>
          </div>
        </div>
        <div id='modalpizzas' className='modal fade' aria-hidden='true'>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header d-flex justify-content-between'>
                <label className='h5 text-center' style={{ flex: 1 }}>{title}</label>
                <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
              </div>
              <div className='modal-body'>
                <input type="hidden" id="id" ></input>
                <div className='input-group mb-3'>
                  <span className='input-group-text'><i className='fa-solid fa-hashtag'></i></span>
                  <input type='text' id='piz_id' className='form-control' placeholder='Id pizza' value={piz_id}
                    onChange={(e) => setId(e.target.value)} disabled></input>
                </div>
                <div className='input-group mb-3'>
                  <span className='input-group-text'><i className='fa-solid fa-pizza-slice'></i></span>
                  <input type='text' id='piz_name' className='form-control' placeholder='Nombre' value={piz_name}
                    onChange={handleNameChange}></input>
                </div>
                <div className='input-group mb-3'>
                  <span className='input-group-text'><i className='fa-solid fa-earth-americas'></i></span>
                  <input type='text' id='piz_origin' className='form-control' placeholder='Origen' value={piz_origin}
                    onChange={(e) => setOrigin(e.target.value)}></input>
                </div>
                <div className='input-group mb-3'>
                  <span className='input-group-text'><i className='fa-solid fa-list-ul'></i></span>
                  <select
                    id='piz_state'
                    className='form-control'
                    value={piz_state}
                    onChange={handleStateChange}
                  >
                    <option value="" disabled>- Seleccione el estado -</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </div>
                <div className='input-group mb-3 d-flex justify-content-center'>
                <button className='btn btn-warning' data-bs-toggle='modal' data-bs-target='#modalpizzas2'>
                  <i className='fa-solid fa-circle-plus'></i> {getSubstringUntilFirstMatch(title, " ")} ingrediente/s
                </button>
              </div>
                <div className='d-grid col-6 mx-auto'>
                  <button onClick={handleFormSubmitPizzas} className='btn btn-success'>
                    <i className='fa-solid fa-floppy-disk'></i> Guardar
                  </button>
                </div>
              </div>
              <div className='modal-footer'>
                <button type='button' id='btnCerrar' className='btn btn-danger' data-bs-dismiss='modal'>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
        <div id='modalpizzas2' className='modal fade' aria-hidden='true'>
        <div className='modal-dialog'>
          <div className='modal-content'>
            <div className='modal-header d-flex justify-content-between'>
              <label className='h5 text-center' style={{ flex: 1 }}>{title}</label>
              <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
            </div>
            <div className='modal-body'>
              <input type="hidden" id="id" ></input>
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
                  value={piz_state}
                  onChange={handleStateChange}
                >
                  <option value="" disabled>- Seleccione el estado -</option>
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </div>
              <div className='input-group mb-3 d-flex justify-content-center'>
                <button className='btn btn-warning' data-bs-toggle='modal' data-bs-target='#modalpizzas2'>
                  <i className='fa-solid fa-circle-plus'></i> {getSubstringUntilFirstMatch(title, " ")} ingrediente/s
                </button>
              </div>
              <div className='table-responsive'>
                <table className='table table-bordered'>
                  <thead className='thead-dark'>
                    <tr>
                      <th className="text-center">SELECCIONAR</th>
                      <th className="text-center">NOMBRE</th>
                      <th className="text-center">CALORÍAS</th>
                      <th className="text-center">ESTADO</th>
                      <th className="text-center">PORCION</th>
                    </tr>
                  </thead>
                  <tbody className='table-group-divider'>
                    {ingredients.length > 0 ? (
                      ingredients.map((ingredient, index) => {
                        const selectedIngredient = selectedIngredients.find(selIng => selIng.ing_id === ingredient.ing_id);
                        return (
                          <tr key={`${ingredient.ing_id}-${index}`}>
                            <td className="text-center align-middle">
                              <div className="checkbox">
                                <label className='d-flex justify-content-center align-items-center'>
                                  <input
                                    className="text-center align-middle"
                                    type="checkbox"
                                    style={{ width: '18px', height: '18px' }}
                                    onChange={() => handleCheckboxChange(ingredient.ing_id)}
                                    checked={checkboxStates[ingredient.ing_id] || false}
                                  />
                                </label>
                              </div>
                            </td>
                            <td className="text-center align-middle">{ingredient.ing_name}</td>
                            <td className="text-center align-middle">{ingredient.ing_calories}</td>
                            <td className="text-center align-middle">{ingredient.ing_state ? 'True' : 'False'}</td>
                            <td className="text-center align-middle">
                              <input
                                type='text'
                                className='form-control'
                                value={portionStates[ingredient.ing_id] || ''}
                                onChange={(e) => handlePortionChange(ingredient.ing_id, e.target.value)}
                              />

                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">No hay ingredientes para mostrar</td>
                      </tr>
                    )}
                  </tbody>

                </table>
              </div>
              <div className='d-grid col-6 mx-auto'>
                <button onClick={handleFormSubmitIngredients} className='btn btn-success'>
                  <i className='fa-solid fa-floppy-disk'></i> Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default ShowPizzas