import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/InnerImageZoom/styles.css';

const ImageZoom = ({ photo, zoomPhoto }) => (
    // <div>
        <InnerImageZoom
            src={photo}
            zoomSrc={zoomPhoto ? zoomPhoto : photo}
            zoomScale={1}
            className="md:h-96 md:w-80 lg:h-[600px] lg:w-[480px] rounded relative"
        />
    // </div>
);
export default ImageZoom;
