import React from 'react';
import Tilt from 'react-tilt'
import logoimg from './logoimg.png';
import './Logo.css';

const Logo = () => {
	return (
		<div className='ma4 mt0'>
			<Tilt className="Tilt br2 shadow-2" options={{ max : 55 }} style={{ height: 160, width: 160 }} >
 			 <div className="Tilt-inner pa3"> 
 			 	<img style={{padding: '1px'}} alt='logo' src={logoimg}/>
 			 </div>
			</Tilt>
		</div>
	);
}

export default Logo;