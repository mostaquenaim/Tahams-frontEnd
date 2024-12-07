import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/InnerImageZoom/styles.css';

const ImageZoom = ({ photo }) => (
    <div>
        <InnerImageZoom
            src={photo}
            zoomSrc={photo}
            zoomScale={2.5}
            className="md:h-96 md:w-96 lg:h-[600px] lg:w-[600px] max-h-screen rounded mb-5 relative"
        />
    </div>
);
export default ImageZoom;
