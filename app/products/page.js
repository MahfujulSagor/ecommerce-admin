import Link from 'next/link';
import React from 'react'

const Products = () => {
  return (
    <div>
      <Link href={'/products/new'}>add new product</Link>
    </div>
  )
}

export default Products;

export const metadata = {
  title: 'Agora: Products',
  description: 'Explore the various products available on Agora.',
};
