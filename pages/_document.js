import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" data-theme="light">
        <Head>
          {/* Google Tag Manager */}
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-PP551NL7F0"></script>
          <script dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-PP551NL7F0');
            `
          }} />
        </Head>
        <body className='font-montserrat'>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
