import React from 'react';
import ReacDom from 'react-dom/client';

function index() {
  return (
    <div>
      <h1>Hello, World!</h1>
    </div>
  );
}

const root = ReacDom.createRoot(document.getElementById('root'));
root.render(<index />);
