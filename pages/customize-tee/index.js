import TShirtCustomizer from "/components/Customize/testcustomize";
import CustomizeYourTee from "/components/Customize/CustomizeYourTee";

const CustomizeTee = () => {
    return (
        <div className='pt-20 md:pt-40 pb-10'>
            <CustomizeYourTee></CustomizeYourTee>
            {/* <TShirtCustomizer></TShirtCustomizer> */}
        </div>
    );
};

export default CustomizeTee;