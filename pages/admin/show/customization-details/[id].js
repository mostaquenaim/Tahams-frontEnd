import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useCustomizationReq from '/Hooks/useCustomizationReq';
import Link from 'next/link';

const CustomizationDetails = () => {
  const pathParts = window.location.pathname.split('/');
  const id = pathParts[pathParts.length - 1];

  const [customizations, refetch, isPending] = useCustomizationReq(id);
  // console.log(customizations,'sdsd');

  const [error, setError] = useState(null);

  if (isPending) {
    return (
      <div className="text-center py-8">Loading customization details...</div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  if (
    !customizations ||
    !Array.isArray(customizations) ||
    customizations.length === 0
  ) {
    return (
      <div className="text-center py-8">Customization request not found.</div>
    );
  }

  // Get the first item for general information (they should have the same general details)
  const mainCustomization = customizations[0];

  // Group by side for easy access
  // const frontSide = customizations.find(item => item.side === 'front');
  // const backSide = customizations.find(item => item.side === 'back');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/admin/show/show-customization-requests"
          className="text-blue-600 hover:underline"
        >
          &larr; Back to all requests
        </Link>
        <h1 className="text-3xl font-bold mt-4">
          Customization Request Group #{mainCustomization.groupId?.slice(-8)}
        </h1>
        <div className="flex items-center gap-4 mt-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              mainCustomization.status === 'approved'
                ? 'bg-green-100 text-green-800'
                : mainCustomization.status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {mainCustomization.status}
          </span>
          <span className="text-gray-600">
            Submitted on{' '}
            {new Date(mainCustomization.submittedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Customer Info and Order Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Name:</span>{' '}
                {mainCustomization.name}
              </p>
              <p>
                <span className="font-medium">Phone:</span>{' '}
                {mainCustomization.phone}
              </p>
              <p>
                <span className="font-medium">Address:</span>{' '}
                {mainCustomization.address}
              </p>
              {mainCustomization.user && (
                <p>
                  <span className="font-medium">User:</span>{' '}
                  {mainCustomization.user?.name ||
                    mainCustomization.user?.email}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Total Quantity:</span>{' '}
                {customizations[0].quantity || customizations[1].quantity}
              </p>
              <p>
                <span className="font-medium">Size:</span>{' '}
                {mainCustomization.size || 'Not specified'}
              </p>
              <p>
                <span className="font-medium">Color:</span>{' '}
                {mainCustomization.color}
              </p>
              <p>
                <span className="font-medium">Printing Method:</span>{' '}
                {mainCustomization.printingMethod || 'Not specified'}
              </p>
              <p>
                <span className="font-medium">Sides:</span>{' '}
                {customizations.map((item) => item.side).join(', ')}
              </p>
            </div>
          </div>

          {/* Special Instructions */}
          {mainCustomization.specialInstructions &&
            mainCustomization.specialInstructions !== '0' && (
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-xl font-semibold mb-2">
                  Special Instructions
                </h2>
                <p className="whitespace-pre-line">
                  {mainCustomization.specialInstructions}
                </p>
              </div>
            )}
        </div>

        {/* Right Column - Design Details for Each Side */}
        <div className="lg:col-span-2 space-y-6">
          {customizations.map((customization) => (
            <div
              key={customization.id}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold capitalize">
                  {customization.side} Side Design
                </h2>
                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                  ID: {customization.id}
                </span>
              </div>

              {/* T-Shirt Preview */}
              <div className="mb-6">
                <div className="border rounded-md overflow-hidden max-w-md mx-auto">
                  <img
                    src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${customization.previewImage}`}
                    alt={`${customization.color} t-shirt ${customization.side} design`}
                    className="w-full h-auto"
                  />
                </div>
                <p className="text-center mt-2 text-sm text-gray-600">
                  Quantity: {customization.quantity}
                </p>
              </div>

              {/* Custom Texts for this side */}
              {customization.customTexts?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Custom Texts</h3>
                  <div className="space-y-3">
                    {customization.customTexts.map((text) => (
                      <div
                        key={text.id}
                        className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p
                              className={`text-lg font-medium rounded p-2 inline-block ${
                                text.color === '#ffffff' ||
                                text.color === '#FFFFFF'
                                  ? 'bg-black'
                                  : 'bg-white border'
                              }`}
                              style={{
                                fontFamily: text.fontFamily,
                                fontSize: `${Math.min(text.fontSize, 20)}px`, // Limit font size for display
                                fontWeight: text.fontWeight,
                                color: text.color,
                                transform: `rotate(${text.rotation || 0}deg)`,
                              }}
                            >
                              {text.content}
                            </p>
                            <div className="text-sm text-gray-600 mt-2">
                              <div className="grid grid-cols-2 gap-2">
                                <p>Font: {text.fontFamily}</p>
                                <p>Size: {text.fontSize}px</p>
                                <p>Weight: {text.fontWeight}</p>
                                <p>Rotation: {text.rotation || 0}°</p>
                              </div>
                              <p className="mt-1 flex items-center">
                                Color:{' '}
                                <span
                                  className="inline-block w-4 h-4 rounded-full border border-gray-300 ml-1 mr-1"
                                  style={{ backgroundColor: text.color }}
                                ></span>{' '}
                                {text.color}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs bg-white px-2 py-1 rounded border ml-4">
                            <p>
                              Position: ({text.x}, {text.y})
                            </p>
                            <p>
                              Size: {text.width}×{text.height}px
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Images for this side */}
              {customization.customImages?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Custom Images</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customization.customImages.map((image) => (
                      <div
                        key={image.id}
                        className="border rounded-md overflow-hidden bg-gray-50"
                      >
                        <div className="p-4">
                          <img
                            src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${image.filename}`}
                            alt="Custom design"
                            className="w-full h-32 object-contain bg-white rounded"
                          />
                        </div>
                        <div className="p-3 border-t bg-white">
                          <h4 className="font-medium text-sm truncate">
                            {image.filename}
                          </h4>
                          <div className="text-xs text-gray-600 mt-1 space-y-1">
                            <div className="grid grid-cols-2 gap-1">
                              <p>
                                Original: {image.originalWidth}×
                                {image.originalHeight}px
                              </p>
                              <p>
                                Display: {image.width}×{image.height}px
                              </p>
                            </div>
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

              {/* Show message if no custom content */}
              {(!customization.customTexts ||
                customization.customTexts.length === 0) &&
                (!customization.customImages ||
                  customization.customImages.length === 0) && (
                  <div className="text-center py-4 text-gray-500">
                    No custom texts or images for this side
                  </div>
                )}
            </div>
          ))}

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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium">Request Submitted</p>
                  <p className="text-sm text-gray-600">
                    {new Date(mainCustomization.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {mainCustomization.reviewedAt && (
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
                      {new Date(mainCustomization.reviewedAt).toLocaleString()}
                    </p>
                    {mainCustomization.reviewerNote && (
                      <p className="text-sm mt-1 bg-blue-50 p-2 rounded">
                        <span className="font-medium">Note:</span>{' '}
                        {mainCustomization.reviewerNote}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {mainCustomization.approvedAt && (
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
                      {new Date(mainCustomization.approvedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {mainCustomization.rejectedAt && (
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
                      {new Date(mainCustomization.rejectedAt).toLocaleString()}
                    </p>
                    {mainCustomization.rejectionReason && (
                      <p className="text-sm mt-1 bg-red-50 p-2 rounded">
                        <span className="font-medium">Reason:</span>{' '}
                        {mainCustomization.rejectionReason}
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
      {mainCustomization.status === 'draft' && (
        <div className="mt-8 flex justify-end space-x-4">
          <button className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
            Edit Request
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Submit for Review
          </button>
        </div>
      )}

      {mainCustomization.status !== 'draft' && (
        <div className="mt-8 flex justify-end space-x-4">
          <button className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
            Download Design Files
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
            Contact Customer
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomizationDetails;
