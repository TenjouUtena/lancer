'use client'

import {useState} from 'react';
import {NewArtist} from './newartist.js';
import {ArtistList} from './artistlist.js';
import { ArtistEdit } from './artistedit.js';

export default function Artists() {
    const [show_new, SetShowNew] = useState(false);
    const [artist, setArtist] = useState({id:0, name:"Kredden"});

    const toggle_new = (e) => {
        SetShowNew(true)
    }

    const cancel_new = (e) => {
        SetShowNew(false)
    }

    return (
        <div className="absolute inset-0 min-w-fit min-h-fit">
            <div className={(show_new ? "fixed z-10" : "hidden z-10")}>
                <NewArtist cancel_new={cancel_new}/>
            </div>
            <button onClick={toggle_new}>Push Me!</button>
            <p />
            <ArtistList />
            <p className='min-h-10'/>
            <ArtistEdit artist={artist} />


        </div>
    )
}