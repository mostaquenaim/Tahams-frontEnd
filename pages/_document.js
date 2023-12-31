import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" data-theme="light">
        <Head />
        
        <body className='font-montserrat'>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
