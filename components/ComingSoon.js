import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const ComingSoon = ({ pageTitle }) => {
  return (
    <div className="min-h-screen bg-gray-100 py-20 lg:pt-40 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full text-center rounded-lg p-10">
        {/* <div className="flex justify-center mb-6">
          <div className="bg-gray-100 rounded-full p-4">
            <Clock className="w-10 h-10 text-black" />
          </div>
        </div> */}

        <h1 className="text-3xl sm:text-4xl text-gray-800 mb-3">
          {pageTitle}
        </h1>
        <p className="text-gray-600 text-lg mb-8">This page is coming soon</p>

        <Link href="/" className="btn btn-outline  capitalize gap-2 group mt-3">
          <ArrowLeft
            size={18}
            className="transition-transform duration-200 group-hover:-translate-x-1"
          />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ComingSoon;
