
import React,{useEffect, useState} from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { showAlert } from '../functions';

const ShowPizzas = () => {
    const url ='http://api-pizzas.run';
    const [pizzas , setPizzas]= useState ([]);
    const [id,sedId]=useState('');
    const [name,setName]=useState ('');
    const [origin, setOrigin]=useState('');
    const [state, setState]= useState('');
    const [operation, setOperation]= useState(1);
    const [title, setTitle]= useState('');

    useEffect ( ()=>{
        getPizzas();
    },[]);

    const getPizzas = async () => {
      try {
          const response = await axios.get(url);
          setPizzas(response.data);
      } catch (error) {
          console.error("Error fetching pizzas:", error);
          // Handle the error appropriately
      }
  }
  

  return (
    <div className = 'APp'>
        <div className='container-fluid'>
             <div className='row mt-3'>
                <div className='col-md-4 offset-md-4'>
                    <div className='d-grid mx-auto'>
                        <button className='btn btn-dark' data-bs-toggle='modal' data-bs-target='#modalproducts'>
                            <i className='fa-solid fa-circle-plus'></i> Añadir
                        </button>
                    </div> 
                </div>
            </div>
        </div>
        <div className='modal fade'>   
                
        </div>       
    </div>
  )
}

export default ShowPizzas