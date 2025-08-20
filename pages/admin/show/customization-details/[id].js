import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useCustomizationReq from '/Hooks/useCustomizationReq';
import Link from 'next/link';

const CustomizationDetails = () => {
  const pathParts = window.location.pathname.split('/');
  const id = pathParts[pathParts.length - 1];
  console.log(id); // gives you "asid" from "/kjndfj/asid"

  //   const { id } = useParams();
  const [customizations, refetch, isPending] = useCustomizationReq(id);
  console.log(customizations, 'gibg');

  //   const [customization, setCustomization] = useState(null);
  //   const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (isPending) {
    return (
      <div className="text-center py-8">Loading customization details...</div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  if (!customizations) {
    return (
      <div className="text-center py-8">Customization request not found.</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin/show/show-customization-requests" className="text-blue-600 hover:underline">
          &larr; Back to all requests
        </Link>
        <h1 className="text-3xl font-bold mt-4">
          Customization Request #{customizations.id}
        </h1>
        <div className="flex items-center gap-4 mt-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              customizations.status === 'approved'
                ? 'bg-green-100 text-green-800'
                : customizations.status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {customizations.status}
          </span>
          <span className="text-gray-600">
            Submitted on{' '}
            {new Date(customizations.submittedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Preview and Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">T-Shirt Preview</h2>
            <div className="border rounded-md overflow-hidden">
              <img
                src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${customizations.previewImage}`}
                alt={`${customizations.color} t-shirt ${customizations.side} design`}
                className="w-full h-auto"
              />
            </div>
            <div className="mt-4">
              <p className="capitalize">
                <span className="font-medium">Color:</span>{' '}
                {customizations.color}
              </p>
              <p className="capitalize">
                <span className="font-medium">Side:</span> {customizations.side}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Name:</span> {customizations.name}
              </p>
              <p>
                <span className="font-medium">Phone:</span>{' '}
                {customizations.phone}
              </p>
              <p>
                <span className="font-medium">Address:</span>{' '}
                {customizations.address}
              </p>
              {customizations.user && (
                <p>
                  <span className="font-medium">User:</span>{' '}
                  {customizations.user?.name || customizations.user?.email}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Quantity:</span>{' '}
                {customizations.quantity || 'Not specified'}
              </p>
              <p>
                <span className="font-medium">Size:</span>{' '}
                {customizations.size || 'Not specified'}
              </p>
              <p>
                <span className="font-medium">Printing Method:</span>{' '}
                {customizations.printingMethod || 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Design Details */}
        <div className="lg:col-span-2 space-y-6">
          {customizations.specialInstructions && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold mb-2">
                Special Instructions
              </h2>
              <p className="whitespace-pre-line">
                {customizations.specialInstructions}
              </p>
            </div>
          )}

          {/* Custom Texts Section */}
          {customizations.customTexts?.length > 0 && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold mb-4">Custom Texts</h2>
              <div className="space-y-4">
                {customizations.customTexts.map((text) => (
                  <div
                    key={text.id}
                    className="border-l-4 border-blue-500 pl-4 py-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p
                          className={`text-lg font-medium rounded-lg p-1 ${text.color === '#ffffff' ? 'bg-black' : 'bg-white'}`}
                          style={{
                            fontFamily: text.fontFamily,
                            fontSize: `${text.fontSize}px`,
                            fontWeight: text.fontWeight,
                            color: text.color,
                          }}
                        >
                          {text.content}
                        </p>
                        <div className="text-sm text-gray-600 mt-1">
                          <p>
                            Font: {text.fontFamily}, Size: {text.fontSize}px,
                            Weight: {text.fontWeight}
                          </p>
                          <p>
                            Color:{' '}
                            <span
                              className="inline-block w-3 h-3 rounded-full border border-gray-300"
                              style={{ backgroundColor: text.color }}
                            ></span>{' '}
                            {text.color}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm bg-gray-100 px-2 py-1 rounded">
                        Position: ({text.x}, {text.y})<br />
                        Dimensions: {text.width}×{text.height}px
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Images Section */}
          {customizations.customImages?.length > 0 && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold mb-4">Custom Images</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customizations.customImages.map((image) => (
                  <div
                    key={image.id}
                    className="border rounded-md overflow-hidden"
                  >
                    <div className="p-2 bg-gray-50">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${image.filename}`}
                        alt="Custom design"
                        className="w-full h-48 object-contain"
                      />
                    </div>
                    <div className="p-3 border-t">
                      <h3 className="font-medium truncate">{image.filename}</h3>
                      <div className="text-sm text-gray-600 mt-1 space-y-1">
                        <p>
                          Original: {image.originalWidth}×{image.originalHeight}
                          px
                        </p>
                        <p>
                          Display: {image.width}×{image.height}px
                        </p>
                        <p>
                          Position: ({image.x}, {image.y})
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status History Section */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Status History</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium">Request Submitted</p>
                  <p className="text-sm text-gray-600">
                    {new Date(customizations.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {customizations.reviewedAt && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">Reviewed by Team</p>
                    <p className="text-sm text-gray-600">
                      {new Date(customizations.reviewedAt).toLocaleString()}
                    </p>
                    {customizations.reviewerNote && (
                      <p className="text-sm mt-1 bg-blue-50 p-2 rounded">
                        <span className="font-medium">Note:</span>{' '}
                        {customizations.reviewerNote}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {customizations.approvedAt && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">Approved</p>
                    <p className="text-sm text-gray-600">
                      {new Date(customizations.approvedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {customizations.rejectedAt && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">Rejected</p>
                    <p className="text-sm text-gray-600">
                      {new Date(customizations.rejectedAt).toLocaleString()}
                    </p>
                    {customizations.rejectionReason && (
                      <p className="text-sm mt-1 bg-red-50 p-2 rounded">
                        <span className="font-medium">Reason:</span>{' '}
                        {customizations.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {customizations.status === 'draft' && (
        <div className="mt-8 flex justify-end space-x-4">
          <button className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
            Edit Request
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Submit for Review
          </button>
        </div>
      )}

      {customizations.status !== 'draft' && (
        <div className="mt-8 flex justify-end space-x-4">
          <button className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
            Download Design Files
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Contact Customer
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomizationDetails;
