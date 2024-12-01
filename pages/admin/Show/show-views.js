import { FaSync } from "react-icons/fa";
import Heading from "../../../components/Header/Heading";

const ShowViews = () => {
    return (
        <div>
            <Heading first="Views" />
            <p className="flex justify-end">
                <button className="btn btn-accent mr-3 mt-3">
                    <FaSync/> Sync
                </button>
            </p>
        </div>
    );
};

export default ShowViews;