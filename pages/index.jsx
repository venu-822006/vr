import React from 'react';
import App from '../src/App';
import Head from 'next/head';

export default function Home({ products }) {
  return (
    <>
      <Head>
        <title>Venkataramana Vegetables - Fresh Delivery</title>
        <meta name="description" content="Buy fresh tomatoes, onions, and vegetables in Tirupati." />
      </Head>
      <App initialProducts={products} />
    </>
  );
}

export async function getServerSideProps() {
  let products = [];
  try {
    const res = await fetch('http://127.0.0.1:5000/api/products');
    if (res.ok) {
      products = await res.json();
    }
  } catch (e) {
    console.error('Failed to fetch initial products', e);
  }
  return {
    props: { products }
  };
}
