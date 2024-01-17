
import React,{useEffect, useState} from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { showAlert } from '../functions';

const showPizzas = () => {
    const url ='http://api-pizzas.run';
    const [pizzas ,setPizzas]= useState ([]);
    const [id,sedId]=useState('');
    const [name,setName]=useState ('');
    const [origin, setOrigin]=useState('');
    const [state, setState]= useState('');
    const [operation, setOperation]= useState(1);
    const [title, setTitle]=useState('');

    useEffect ( ()=>{
        getPizzas();
    },[]);

    const getPizzas = async ()=>{
        const respuesta = await axios.get(url);
        setPizzas(respuesta.data);
    }

  return (
    <div>showPizzas</div>
  )
}

export default showPizzas