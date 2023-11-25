import { useState } from "react";
import ReactiveButton from "reactive-button";
import { FaCartShopping } from "react-icons/fa6";

function CartButton() {
    const [state, setState] = useState('idle');

    const onClickHandler = () => {
        setState('loading');

        // send an HTTP request
        setTimeout(() => {
            setState('success');
        }, 1000);
    };

    return (
        <ReactiveButton
            buttonState={state}
            idleText="Add to Cart"
            loadingText="Adding"
            successText="Added"
            onClick={onClickHandler}
        />
    );

}

export default CartButton