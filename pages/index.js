"use client"

import { useEffect } from "react"
import Head from "next/head"
import WhatsAppBusiness from "../components/WhatsAppBusiness"

export default function Home() {
  // Ensure the page is client-side rendered
  useEffect(() => {
    // Any client-side initialization can go here
  }, [])

  return (
    <>
      <Head>
        <title>WhatsApp Sender</title>
        <meta name="description" content="WhatsApp Business Messaging Platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <WhatsAppBusiness />
      </main>
    </>
  )
}

