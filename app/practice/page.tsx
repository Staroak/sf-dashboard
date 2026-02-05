"use client"
import { useState, useEffect } from 'react'

export default function PracticePage() {
    const [data, setData] = useState<any>(null)
    useEffect(() => {
        async function fetchData(){
        const res = await fetch('/api/practice')
        const json = await res.json()
            setData(json)
        }
        fetchData()
        

    },[])

    return (
        <div>
            <h1> Practice Page </h1>
            <p>Applications: {data?.daily?.applicationsTaken}</p> 
               Submissions: {data?.daily?.submissions}<p>
               Appraisals: {data?.daily?.appraisalsOrdered}</p>


        </div>
    )
}