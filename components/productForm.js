import React from 'react'

const ProductForm = () => {
  return (
    <div>
      <form action="">
        <label htmlFor="name">Name</label>
        <input type="text" name="name" id="name"/>
        <label htmlFor="description">Description</label>
        <input type="text" name="description" id="description"/>
        <label htmlFor="price">Price</label>
        <input type="number" name="price" id="price"/>
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default ProductForm
