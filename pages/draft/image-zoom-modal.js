import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

const ImageZoomModal = () => (
  <div className='pt-40'>
    <Zoom>
    <img
      src="/Couple-Tshirt-min.png"
      alt="Zoomable"
      style={{ width: '300px', height: 'auto' }}
    />
  </Zoom>
  </div>
);
export default ImageZoomModal;
