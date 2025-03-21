import Link from 'next/link';
import React from 'react'

const Categories = () => {
  return (
    <div>
      <Link href="/categories/new">Add new categories</Link>
    </div>
  );
};

export default Categories

export const metadata = {
  title: 'Agora: Categories',
  description: 'Explore the various categories available on Agora.',
};
