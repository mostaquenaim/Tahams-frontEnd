import CustomizeDraft2 from '/components/Customize/CustomizeDraft2';
import TshirtDesigner from '/components/Customize/CustomizeDraft';
import CustomizeYourTee from '/components/Customize/CustomizeYourTee';
import React from 'react';
import TshirtCustomizerGPT from '/components/Customize/TShirtCustomizerGPT';
import TShirtDesigner from '/components/Customize/ClaudeCustomize';

const CustomizeTee = () => {
    return (
        <div className='pt-20 md:pt-40 pb-10'>
            {/* <TshirtDesigner></TshirtDesigner> */}
            {/* <CustomizeDraft2></CustomizeDraft2> */}
            {/* <CustomizeYourTee></CustomizeYourTee> */}
            {/* <TshirtCustomizerGPT></TshirtCustomizerGPT> */}
            <TShirtDesigner></TShirtDesigner>
        </div>
    );
};

export default CustomizeTee;