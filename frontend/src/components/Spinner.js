import React from 'react';

export default function Spinner() {
  return (
    <div className='spinner'>
      <div className='lds-ring'>
        <div />
        <div />
        <div />
        <div />
      </div>
    </div>
  );
}
