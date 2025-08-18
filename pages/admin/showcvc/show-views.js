import { FaSync } from "react-icons/fa";
import Heading from "../../../components/Header/Heading";
import Head from "next/head";

const ShowViews = () => {
    return (
        <div>
            <Head>
                <title>Show Views </title>
            </Head>
            <Heading first="Views" />
            <p className="flex justify-end">
                <button className="btn btn-accent mr-3 mt-3">
                    <FaSync /> Sync
                </button>
            </p>
        </div>
    );
};

export default ShowViews;