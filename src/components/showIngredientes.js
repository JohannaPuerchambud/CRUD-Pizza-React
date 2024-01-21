import React, { useRef, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import ReactPaginate from 'react-paginate';
import Swal from 'sweetalert2';
import { showAlert } from '../functions';
import { Link } from 'react-router-dom';

Modal.setAppElement('#root');

const ShowIngredientes = () => {
    const url = 'http://localhost:3000/ingredientes'; // Asegúrate de que esta es la URL correcta para tu API de ingredientes
    const [ingredientes, setIngredientes] = useState([]);
    const [filtrarIngredientes, setFiltrarIngredientes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [ing_id, setIngId] = useState('');
    const [ing_name, setIngName] = useState('');
    const [ing_calories, setIngCalories] = useState(0);
    const [ing_state, setIngState] = useState(false);
    const [operation, setOperation] = useState(1);
    const [title, setTitle] = useState('');
    const [pageCount, setPageCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [recordsPerPage, setRecordsPerPage] = useState(5);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [entriesToShow, setEntriesToShow] = useState(5);
    const [error, setError] = useState(null);

    const inputRef = useRef(null);

    const handleStateChange = (e) => {
        setIngState(e.target.value === 'true'); // Changed to directly set boolean value
    };
    const handleNameChange = (e) => {
        setIngName(e.target.value); // Actualizar el estado con el valor del input
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
        if (modalIsOpen) {
            inputRef.current?.focus();
        }
    }, [modalIsOpen]);

    useEffect(() => {
        const filteredResults = searchTerm
            ? ingredientes.filter(ingrediente =>
                ingrediente.ing_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ingrediente.ing_calories.toLowerCase().includes(searchTerm.toLowerCase())
            )
            : ingredientes;
        setFiltrarIngredientes(filteredResults);
        setPageCount(Math.ceil(filteredResults.length / recordsPerPage));
    }, [searchTerm, ingredientes, recordsPerPage]);

    const getIngredientes = useCallback(async () => {
        try {
            const response = await axios.get(url);
            setIngredientes(response.data);
            setPageCount(Math.ceil(response.data.length / recordsPerPage));
        } catch (error) {
            console.error("Error fetching ingredientes:", error);
            showAlert('Error fetching ingredientes', 'error');
            setError(error.toString());
        }
    }, [url, recordsPerPage]);

    useEffect(() => {
        getIngredientes();
    }, [getIngredientes]);

    const openModal = (op, ing_id = '', ing_name = '', ing_calories = '', ing_state = '') => {
        setIngId(ing_id);
        setIngName(ing_name);
        setIngCalories(ing_calories);
        setIngState(op === 1 ? '' : ing_state); 
        setOperation(op);
        setIsOpen(true);
        setTitle(op === 1 ? 'Registrar ingrediente' : 'Editar ingrediente');
        window.setTimeout(() => {
            document.getElementById('ing_name').focus();
        }, 500);

    };
    const closeModal = () => {
        setIsOpen(false); // Close the modal
    };
    const validateForm = () => {
        if (!ing_name.trim()) {
            showAlert('Escribe el nombre del ingrediente', 'warning');
            return false;
        }
        if (!ing_calories.trim()) {
            showAlert('Escribe el origen de la pizza', 'warning');
            return false;
        }
        if (ing_state !== true && ing_state !== false) {
            showAlert('Escribe el estado de la pizza', 'warning');
            return false;
        }
        return true;
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
                // Append ing_id as query param for DELETE
                endpoint += `?ing_id=${parametros.ing_id}`;
                config = {
                    method: metodo,
                    url: endpoint,
                };
            }
            const response = await axios(config);
            if (callback && response.status === 200) {
                callback();
            }
            //}
            // Rest of your response handling code...
        } catch (error) {
            // Error handling
            console.error("Error in enviarSolicitud:", error);
        }
    };
    const handleFormSubmit = () => {
        if (!validateForm()) return;
        const parametros = {
            ing_name: ing_name.trim(),
            ing_calories: ing_calories.trim(),
            ing_state: ing_state,
            ing_id: operation === 2 ? ing_id : undefined // Include ID only for updates
        };

        enviarSolicitud(operation === 1 ? 'POST' : 'PUT', parametros)
            .then(() => {
                closeModal(); 
                getIngredientes(); 
                window.location.reload(); 
            })
            .catch((error) => {
                console.error("Error in handleFormSubmit:", error);
            });
    };
    const deleteIngrediente = (ing_id, ing_name) => {
        if (!ing_id) {
            showAlert('Id no valido para eliminacion', 'error');
        }
        Swal.fire({
            title: `¿Seguro de eliminar el producto ${ing_name}?`,
            icon: 'question',
            text: 'No se podrá dar marcha atrás',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                enviarSolicitud('DELETE', { ing_id: ing_id });
                window.location.reload();
            } else {
                showAlert('El producto NO fue eliminado', 'info');
            }
        });
    }

    return (

        <div className='App'>
            {error && <div className="alert alert-danger">Error: {error}</div>} { }
            <div className='container-fluid'>
                <div className='row mb-3'>
                    <div className='col-12'>
                        <h2 className='text-center p-3'>Administración de Ingredientes</h2>
                    </div>
                </div>
                <div className='row mb-3'>
                    <div className='col-12 d-flex justify-content-center'>
                        <button onClick={() => openModal(1)} className='btn btn-dark' data-bs-toggle='modal' data-bs-target='#modalingredientes'>
                            <i className='fa-solid fa-circle-plus'></i> Añadir
                        </button>
                    </div>
                    <div />
                </div>
                <div className='col-lg-6'></div>
                <div className='col-lg-8 offset-lg-2'>
                    {filtrarIngredientes.length > 0 && (
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
                                    <tr><th>ID</th><th>NOMBRE</th><th>CALORIAS</th><th>ESTADO</th><th>OPCIONES</th></tr>
                                </thead>
                                <tbody className='table-group-divider'>
                                    {
                                        filtrarIngredientes.length > 0 ? (
                                            filtrarIngredientes
                                                .slice(currentPage * recordsPerPage, (currentPage * recordsPerPage) + recordsPerPage)
                                                .map((ingrediente, index) => (
                                                    // Your existing row rendering logic
                                                    <tr key={ingrediente.ing_id}>
                                                        <td>{(currentPage * recordsPerPage) + index + 1}</td>
                                                        <td>{ingrediente.ing_name}</td>
                                                        <td>{ingrediente.ing_calories}</td>
                                                        <td>{ingrediente.ing_state ? 'True' : 'False'}</td>
                                                        <td>
                                                            <button onClick={() => openModal(2, ingrediente.ing_id, ingrediente.ing_name, ingrediente.ing_calories, ingrediente.ing_state)} className='btn btn-success'
                                                                data-bs-toggle='modal' data-bs-target='#modalingredientes'>
                                                                <i className='fa-solid fa-edit'></i>
                                                            </button>
                                                            &nbsp;
                                                            <button onClick={() => deleteIngrediente(ingrediente.ing_id, ingrediente.ing_name)} className='btn btn-info'>
                                                                <i className='fa-solid fa-trash'></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center">No hay ingredientes para mostrar</td>
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
                            <option value="5">5</option>
                            <option value="10">10</option>
                            {/* Agregar más opciones de ser necesario */}
                        </select>
                        <span className="ms-2 align-self-center">entradas</span>
                    </div>
                </div>
            </div>
            <div id='modalingredientes' className='modal fade' aria-hidden='true'>
                <div className='modal-dialog'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <label className='h5'>{title}</label>
                            <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
                        </div>
                        <div className='modal-body'>
                            <input type="hidden" id="id" ></input>
                            <div className='input-group mb-3'>
                                <span className='input-group-text'><i className='fa-solid fa-hashtag'></i></span>
                                <input type='text' id='ing_id' className='form-control' placeholder='Id ingrediente' value={ing_id}
                                    onChange={(e) => setIngId(e.target.value)} disabled></input>
                            </div>
                            <div className='input-group mb-3'>
                                <span className='input-group-text'><i className='fa-solid fa-pizza-slice'></i></span>
                                <input type='text' id='ing_name' className='form-control' placeholder='Nombre' value={ing_name}
                                    onChange={handleNameChange}></input>
                            </div>
                            <div className='input-group mb-3'>
                                <span className='input-group-text'><i className='fa-solid fa-earth-americas'></i></span>
                                <input type='text' id='ing_calories' className='form-control' placeholder='Origen' value={ing_calories}
                                    onChange={(e) => setIngCalories(e.target.value)}></input>
                            </div>
                            <div className='input-group mb-3'>
                                <span className='input-group-text'><i className='fa-solid fa-list-ul'></i></span>
                                <select
                                    id='ing_state'
                                    className='form-control'
                                    value={ing_state}
                                    onChange={handleStateChange}
                                >
                                    <option value="" disabled>- Seleccione el estado -</option>
                                    <option value="true">True</option>
                                    <option value="false">False</option>
                                </select>
                            </div>
                            <div className='d-grid col-6 mx-auto'>
                                <button onClick={handleFormSubmit} className='btn btn-success'>
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
        </div>
    );
};

export default ShowIngredientes;