import Head from "next/head";

export default function MyHeader(props) {
  
    return(
        <>
        <Head>
            <title>{props.title}</title>
        </Head>
        <div>
                {
                    props.header ?
                    <h1 className="bg-transparent">
                        {props.header}
                    </h1>
                    :
                    ''
                }
        </div>
        </>
    )
}