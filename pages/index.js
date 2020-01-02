import React from 'react'
import Head from 'next/head'
import Nav from '../components/nav'
import initialize from '../initialize'
import { Address } from 'wakkanay/dist/types'

let client

if (process.browser) {
  initialize().then(c => { client = c })
}

const Home = () => (
  <div>
    <Head>
      <title>Home</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <Nav />
    <button onClick={
      () => {
        if (client) {
          client.deposit(10, Address.from(process.env.TOKEN_ADDRESS))
        }
      }
    }>deposit</button>
    <button onClick={
      () => {
        if (client) {
          console.log('client initialized')
          client.getBalance().then(console.log)
        }
      }
    }>Balance</button>
    <button onClick={() => {
      if (client) {
        client.transfer(6, Address.from(process.env.DEPOSIT_CONTRACT_ADDRESS), Address.default())
      }
    }}>transfer</button>

  </div>
)

export default Home
