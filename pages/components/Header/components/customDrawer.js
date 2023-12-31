import React from 'react';

const customDrawer = () => {
    return (
        <>
            <FormGroup>
                <FormControlLabel control={<Switch defaultChecked />} label="Label" />
                <FormControlLabel required control={<Switch />} label="Required" />
                <FormControlLabel disabled control={<Switch />} label="Disabled" />
            </FormGroup>
        </>
    );
};

export default customDrawer;