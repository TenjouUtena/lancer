'use client'

import { useState } from "react"

export function NewArtist(props) {

    const [formData, setFormData] = useState({name: 'New Artist', faname: '', platform: ''})

    const make_new = (e) => {
       fetch("http://127.0.0.1:5000/api/artists", {method:'PUT',
                                                    headers:{
                                                        'Content-type':'application/json', 
                                                            'Accept':'application/json'},
                                                    body:JSON.stringify(formData)
       });
       props.cancel_new(); 
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    }

    return (
        <div className="bg-red-800 border border-solid rounded-md">
            <fieldset>
                <legend>New Artist</legend>
                <label className="p-3">Name:</label><input onBlur={handleChange} onChange={handleChange} className="text-black p-1" id='name' value={formData.name}></input>
                <br/>
                <label className=" p-3">FA Name:</label><input onChange={handleChange} className="text-black p-1" id='faname' value={formData.faname}></input>
                <br/>
                <label className="p-3">Platform:</label><input onChange={handleChange} className="text-black p-1" id='platform' value={formData.platform}></input>
                <br/>
                <button className="r-0 rounded-full bg-black m-2 p-2" onClick={props.cancel_new}>Cancel</button>
                <button className="r-0 rounded-full bg-black m-2 p-2" onClick={make_new}>Add</button>

            </fieldset>
        </div>
    )
}