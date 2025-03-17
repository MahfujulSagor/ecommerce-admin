import ProductForm from '@/components/productForm';
import React from 'react'

const CreateProduct= () => {
  return (
    <div>
      <ProductForm/>
    </div>
  );
};

export default CreateProduct;

export const metadata = {
  title: 'Agora: Add Products',
  description: 'Add a new product to the Agora marketplace.',
};

