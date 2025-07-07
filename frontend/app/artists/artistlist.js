
import { useEffect, useState } from 'react';
 
export const ArtistList = () => {
    const [value, setValue] = useState([]);
    const refresh = () => {
        fetch( process.env.NEXT_PUBLIC_API_URL+ 'artists/top_5')
        .then(async resp => {
            setValue(await resp.json());
        })
        .catch(error => {
            console.log(error);
        });
    }

    useEffect(() => {
      refresh();
    }, []);


    return ( <div className='max-h-40 overflow-scroll w-fit'>
        {
            value.map(element => {
                return <div draggable="true" className='relative h-10 hover:bg-sky-800 w-11/12 border-2 rounded-sm min-w-96' key={element.id}>
                    <div className='inline p-2 cursor-move'>|||</div>
                    <span className='absolute p-2 left-12'>{element.name}</span>
                    <span className='absolute p-2 left-36'>{element.faname}</span>
                    <span className='absolute p-2 left-52'>{element.platform}</span>
                </div>
            })
        }
    </div> );
}
 