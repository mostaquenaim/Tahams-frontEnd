import dynamic from "next/dynamic";

// Dynamically import GlassMagnifier (supports SSR)
const GlassMagnifier = dynamic(
    () => import("@datobs/react-image-magnifiers").then((mod) => mod.GlassMagnifier),
    { ssr: false }
);
const ImageZoomDatObs = () => {
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
            <GlassMagnifier
                imageSrc="/Couple-Tshirt-min.png" // Your image
                imageAlt="Zoomable Image"
                magnifierSize="200px" // Circular magnifier size
                zoomLevel={2} // Zoom intensity
                magnifierBorderSize={2}
                magnifierBorderColor="black"
            />
        </div>
    );
};

export default ImageZoomDatObs;
