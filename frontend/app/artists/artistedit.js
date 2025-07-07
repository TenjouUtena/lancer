import { useState } from "react";




export const ArtistEdit = (props) => {
    const [formData, setFormData] = useState(props.artist)
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    }



    return ( <div>
        <p>Name: <input className="text-gray-600" onChange={handleChange} id='name' value={formData.name}></input></p>
        <p>FA Name: <input className="text-gray-600" onChange={handleChange} id='faname' value={formData.faname} /></p>
        <p>Platform: <input className="text-gray-600" onChange={handleChange} id='platform' value={formData.platform} /></p>
        <p/>
        <p>Artist Bases:</p>

    </div> );
}