import React from 'react';
import { Alert } from 'reactstrap';
// import "bootstrap/dist/css/bootstrap.min.css";
   
const Error = props => {
    return props.error ? <Alert>{props.error}</Alert> : ''
};

export default Error;