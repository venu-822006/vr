/* eslint-disable no-unused-vars */
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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
    const res = await fetch(`${apiUrl}/api/products`);
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
