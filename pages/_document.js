import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" data-theme="light" className="font-montserrat">
        <Head />

        <body >
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
